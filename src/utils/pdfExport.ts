import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

export interface PdfExportOptions {
  fileName?: string;
  marginMm?: number;
  quality?: number;
}

/**
 * Cache for converted colors to ensure maximum rendering speed.
 */
const colorConversionCache = new Map<string, string>();

let canvasCtx: CanvasRenderingContext2D | null = null;
function getCanvasContext(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null;
  if (!canvasCtx) {
    const c = document.createElement('canvas');
    c.width = 1;
    c.height = 1;
    canvasCtx = c.getContext('2d', { willReadFrequently: true });
  }
  return canvasCtx;
}

/**
 * Converts any modern CSS color (including oklch, oklab, lch, lab)
 * to standard rgb/hex using native browser canvas context.
 * Falls back to clean sRGB values if canvas is unavailable.
 */
export function convertModernColor(colorValue: string): string {
  if (!colorValue || typeof colorValue !== 'string') return colorValue;
  if (!colorValue.includes('oklch') && !colorValue.includes('oklab') && !colorValue.includes('lch') && !colorValue.includes('lab')) {
    return colorValue;
  }

  if (colorConversionCache.has(colorValue)) {
    return colorConversionCache.get(colorValue)!;
  }

  try {
    const ctx = getCanvasContext();
    if (ctx) {
      ctx.fillStyle = '#000000';
      ctx.fillStyle = colorValue;
      const computed = ctx.fillStyle;
      if (computed && !computed.includes('oklch') && !computed.includes('oklab')) {
        colorConversionCache.set(colorValue, computed);
        return computed;
      }
    }
  } catch {
    // ignore canvas parsing error
  }

  // Safe fallback to clean slate/gray if canvas fails
  const fallback = '#1e293b';
  colorConversionCache.set(colorValue, fallback);
  return fallback;
}

/**
 * Exports a specified DOM element to a high-resolution PDF document.
 * Includes complete interception for oklch colors so that html2canvas
 * never crashes on modern Tailwind v4 color tokens.
 */
export async function exportElementToPdf(
  elementId: string,
  options: PdfExportOptions = {}
): Promise<{ success: boolean; error?: string }> {
  const originalWindowGetComputedStyle = window.getComputedStyle;

  try {
    const targetElement = document.getElementById(elementId);
    if (!targetElement) {
      throw new Error(`Element with id "${elementId}" was not found.`);
    }

    // Scroll to top to ensure complete render
    window.scrollTo(0, 0);

    // Global proxy on window.getComputedStyle during rendering
    // This intercepts computed colors that the browser might return in oklch
    window.getComputedStyle = function (elt: Element, pseudoElt?: string | null): CSSStyleDeclaration {
      const origStyle = originalWindowGetComputedStyle.call(window, elt, pseudoElt);
      return new Proxy(origStyle, {
        get(target, prop, receiver) {
          if (prop === 'getPropertyValue') {
            return (propertyName: string) => {
              const val = target.getPropertyValue(propertyName);
              return convertModernColor(val);
            };
          }
          const val = Reflect.get(target, prop, receiver);
          if (typeof val === 'string') {
            return convertModernColor(val);
          }
          return val;
        },
      });
    };

    // Canvas capture with deep stylesheet and computed style sanitization
    const canvas = await html2canvas(targetElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: targetElement.scrollWidth,
      onclone: (clonedDoc: Document) => {
        // 1. Sanitize all <style> elements in cloned document head to replace oklch declarations
        const oklchRegex = /oklch\([^)]+\)/gi;
        const oklabRegex = /oklab\([^)]+\)/gi;

        clonedDoc.querySelectorAll('style').forEach((styleTag) => {
          if (styleTag.textContent) {
            let css = styleTag.textContent;
            if (css.includes('oklch') || css.includes('oklab')) {
              css = css.replace(oklchRegex, (match) => convertModernColor(match));
              css = css.replace(oklabRegex, (match) => convertModernColor(match));
              styleTag.textContent = css;
            }
          }
        });

        // 2. Sanitize inline style attributes on all cloned elements
        clonedDoc.querySelectorAll('*').forEach((node) => {
          const el = node as HTMLElement;
          const inlineStyle = el.getAttribute('style');
          if (inlineStyle && (inlineStyle.includes('oklch') || inlineStyle.includes('oklab'))) {
            const sanitized = inlineStyle
              .replace(oklchRegex, (match) => convertModernColor(match))
              .replace(oklabRegex, (match) => convertModernColor(match));
            el.setAttribute('style', sanitized);
          }
        });

        // 3. Patch cloned window's getComputedStyle
        if (clonedDoc.defaultView) {
          const clonedWin = clonedDoc.defaultView;
          const origClonedGetComputedStyle = clonedWin.getComputedStyle.bind(clonedWin);
          clonedWin.getComputedStyle = function (elt: Element, pseudoElt?: string | null): CSSStyleDeclaration {
            const origStyle = origClonedGetComputedStyle(elt, pseudoElt);
            return new Proxy(origStyle, {
              get(target, prop, receiver) {
                if (prop === 'getPropertyValue') {
                  return (propertyName: string) => {
                    const val = target.getPropertyValue(propertyName);
                    return convertModernColor(val);
                  };
                }
                const val = Reflect.get(target, prop, receiver);
                if (typeof val === 'string') {
                  return convertModernColor(val);
                }
                return val;
              },
            });
          };
        }
      },
    });

    const imgData = canvas.toDataURL('image/png');

    // A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = options.marginMm ?? 8;
    const printableWidth = pageWidth - margin * 2;

    const imgWidth = printableWidth;
    const imgHeight = (canvas.height * printableWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin;

    // Render first page
    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= (pageHeight - margin * 2);

    // Handle multi-page documents if content exceeds single A4 page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= (pageHeight - margin * 2);
    }

    const safeFileName = (options.fileName || 'document').replace(/[^a-zA-Z0-9_-]/g, '_');
    pdf.save(`${safeFileName}.pdf`);

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to generate PDF';
    console.error('PDF generation error:', err);
    return { success: false, error: message };
  } finally {
    // Always restore the original getComputedStyle on the main window
    window.getComputedStyle = originalWindowGetComputedStyle;
  }
}

/**
 * Triggers native browser print dialog for the target element.
 */
export function triggerNativePrint(): void {
  window.print();
}
