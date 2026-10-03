import type { CotizacionDetalleDto, Cliente } from '../types/backend';
import { formatCurrency, formatDateShort } from './pdfUtils';
import { buildConceptosTable } from './pdf/conceptosTableLayout';
import { mapPlantillasSnapshot } from './pdf/plantillas/mapPlantillasSnapshot';

/** Datos de emisor para cabecera/pie (Story 2.2). */
export interface PdfEmisorBranding {
  razonSocial?: string;
  domicilio?: string;
  telefono?: string;
  emailContacto?: string;
  sitioWeb?: string;
}

/** Contenido bancario tenant (Story 2.4). */
export interface PdfBancariosData {
  titular?: string;
  banco?: string;
  cuenta?: string;
  clabe?: string;
  domicilio?: string;
  rfc?: string;
  email?: string;
}

/** Margen superior del PDF; reserva espacio bajo logo/título en saltos de página. */
const PDF_PAGE_MARGIN_TOP = 90;
/** Altura de inicio del cuerpo en pág. 1 (folio alineado como Story 6.16 con margin 62). */
const PDF_FIRST_PAGE_CONTENT_TOP = 62;
const PDF_FIRST_PAGE_TOP_PULL = PDF_PAGE_MARGIN_TOP - PDF_FIRST_PAGE_CONTENT_TOP;

export interface PdfBankPageOptions {
  /** Logo del banco (`bancarios.logoUrl`). */
  logoBase64?: string;
  /** Logo branding tenant / fallback Aestimare (mismo que header PDF). */
  brandingLogoBase64?: string;
  bancarios: PdfBancariosData;
}

function buildDatosBancariosPage(opts: PdfBankPageOptions): any[] {
  const b = opts.bancarios;
  const bankLine = (label: string, value: string) => ({
    text: [{ text: `${label} `, bold: true }, { text: value }],
    style: 'bankLine',
    alignment: 'center' as const,
  });

  const centeredImage = (dataUrl: string, maxW: number, maxH: number, bottom: number) => ({
    columns: [
      { width: '*', text: '' },
      {
        width: 'auto',
        image: dataUrl,
        fit: [maxW, maxH],
      },
      { width: '*', text: '' },
    ],
    margin: [0, 0, 0, bottom] as [number, number, number, number],
  });

  const stack: any[] = [
    {
      text: 'DATOS TRANSFERENCIA BANCARIA',
      style: 'bankSubtitle',
      margin: [0, 8, 0, 14],
    },
  ];

  if (opts.brandingLogoBase64) {
    stack.push(centeredImage(opts.brandingLogoBase64, 140, 100, 12));
  }

  if (b.titular?.trim()) stack.push(bankLine('Nombre:', b.titular.trim()));
  if (b.rfc?.trim()) stack.push(bankLine('RFC:', b.rfc.trim()));
  if (b.domicilio?.trim()) stack.push(bankLine('Domicilio:', b.domicilio.trim()));

  const hasIdentityBlock =
    Boolean(opts.brandingLogoBase64) ||
    Boolean(b.titular?.trim()) ||
    Boolean(b.rfc?.trim()) ||
    Boolean(b.domicilio?.trim());
  const hasBankBlock =
    Boolean(opts.logoBase64) ||
    Boolean(b.banco?.trim()) ||
    Boolean(b.cuenta?.trim()) ||
    Boolean(b.clabe?.trim()) ||
    Boolean(b.email?.trim());

  if (hasIdentityBlock && hasBankBlock) {
    stack.push({ text: ' ', margin: [0, 10] });
  }

  if (opts.logoBase64) {
    stack.push(centeredImage(opts.logoBase64, 120, 90, 10));
  }

  if (b.banco?.trim()) stack.push(bankLine('Banco:', b.banco.trim()));
  if (b.cuenta?.trim()) stack.push(bankLine('No. de Cuenta:', b.cuenta.trim()));
  if (b.clabe?.trim()) {
    stack.push(bankLine('Clabe Interbancaria:', b.clabe.trim()));
  }

  if (b.email?.trim()) {
    const email = b.email.trim();
    stack.push({
      text: [
        { text: 'Mandar comprobante a: ', bold: true },
        {
          text: email,
          link: `mailto:${email}`,
          style: 'bankLink',
        },
      ],
      style: 'bankLine',
      alignment: 'center',
      margin: [0, 10, 0, 0],
    });
  }

  stack.push({ text: ' ', margin: [0, 10] });

  return [
    {
      table: {
        widths: ['*'],
        body: [[{ stack, margin: [28, 12, 28, 12] }]],
      },
      layout: {
        hLineWidth: () => 1,
        vLineWidth: () => 1,
        hLineColor: () => '#000000',
        vLineColor: () => '#000000',
        paddingLeft: () => 0,
        paddingRight: () => 0,
        paddingTop: () => 0,
        paddingBottom: () => 0,
      },
      // Margen superior para equilibrar la caja en LETTER (sin header en esta página)
      margin: [36, 48, 36, 0],
    },
  ];
}

/** Story 8.3 — extras opcionales (imágenes producto ya resueltas a base64). */
export type CotizacionPdfExtras = {
  productImageBase64ByServicioId?: Record<string, string>;
};

export const getCotizacionDefinition = (
  detalle: CotizacionDetalleDto,
  logoBase64: string,
  bankPage?: PdfBankPageOptions,
  emisor?: PdfEmisorBranding,
  extras?: CotizacionPdfExtras,
): any => {
  // Retorna any para evitar errores de tipos de pdfmake si no están instalados
  const incluirDatosBancarios = Boolean(
    detalle.incluirDatosBancarios && bankPage,
  );
  const incluirImagenesPdf = detalle.incluirImagenesPdf === true;
  const productImages = extras?.productImageBase64ByServicioId || {};

  const footerLine1 = emisor?.razonSocial?.trim() || 'Aestimare';
  const footerLine2 = emisor?.domicilio?.trim() || '';
  const contactBits: string[] = [];
  if (emisor?.telefono?.trim()) contactBits.push(`Tel: ${emisor.telefono.trim()}`);
  if (emisor?.emailContacto?.trim()) {
    contactBits.push(emisor.emailContacto.trim());
  }
  if (emisor?.sitioWeb?.trim()) contactBits.push(emisor.sitioWeb.trim());
  const footerLine3 = contactBits.join(' | ');

  // Helpers para obtener datos de forma segura
  const getCliente = (): Partial<Cliente> => {
    // Si hay clienteId poblado, usarlo
    if (typeof detalle.clienteId === 'object')
      return detalle.clienteId as Cliente;

    // Si es cotización guest, usar campos embebidos
    if ((detalle as any).nombreEmpresa) {
      return {
        empresa: (detalle as any).nombreEmpresa,
        rfc: undefined, // Guest quotations no tienen RFC
      };
    }

    return { empresa: 'Cliente no disponible' };
  };

  const getUsuarioCliente = (): {
    nombre?: string;
    email?: string;
    telefono?: string;
    cargo?: string;
  } => {
    const trimOrUndef = (s?: string) => {
      const t = s?.trim();
      return t || undefined;
    };
    const nombre = trimOrUndef(detalle.nombreContacto);
    if (nombre) {
      return {
        nombre,
        email: trimOrUndef(detalle.emailContacto),
        telefono: trimOrUndef(detalle.telefonoContacto),
        cargo: trimOrUndef(detalle.cargoContacto),
      };
    }

    return {
      email: trimOrUndef(detalle.emailContacto),
      cargo: trimOrUndef(detalle.cargoContacto),
    };
  };

  const agregarIva = detalle.agregarIva !== false;
  const iva = detalle.total * 0.16;
  const total = detalle.total + iva;
  const cliente = getCliente();
  const usuario = getUsuarioCliente();

  const conceptosTable = buildConceptosTable({
    items: detalle.items,
    incluirDescripciones: detalle.incluirDescripciones === true,
    incluirImagenesPdf,
    productImageBase64ByServicioId: productImages,
    formatCurrency,
  });

  const mainContent: any[] = [
    // Información General
    {
      columns: [
        {
          width: '*',
          text: '',
        },
        {
          width: 'auto',
          alignment: 'right',
          text: [
            { text: 'Folio: ', bold: true },
            { text: detalle.folio, bold: true, fontSize: 14 },
          ],
        },
      ],
      margin: [0, -PDF_FIRST_PAGE_TOP_PULL, 0, 10],
    },

    {
      style: 'sectionParams',
      table: {
        widths: ['*', '*', '*'],
        body: [
          [
            { text: 'Estado', style: 'paramLabel' },
            { text: 'Fecha', style: 'paramLabel' },
            { text: 'Vencimiento', style: 'paramLabel' },
          ],
          [
            {
              text: detalle.estado.toUpperCase(),
              style: 'paramValue',
              color: getColorForEstado(detalle.estado),
            },
            {
              text: formatDateShort(detalle.fechaCreacion),
              style: 'paramValue',
            },
            {
              text:
                detalle.sinVigencia || !detalle.fechaVencimiento
                  ? '—'
                  : formatDateShort(detalle.fechaVencimiento),
              style: 'paramValue',
            },
          ],
        ],
      },
      layout: 'noBorders',
      margin: [0, -4, 0, 20],
    },

    {
      canvas: [
        {
          type: 'line',
          x1: 0,
          y1: 0,
          x2: 515,
          y2: 0,
          lineWidth: 1,
          lineColor: '#E5E7EB',
        },
      ],
    },
    { text: ' ', fontSize: 5 },

    // Información del Cliente — 2 filas × 3 cols (Story 6.16)
    { text: 'INFORMACIÓN DEL CLIENTE', style: 'sectionHeader' },
    {
      table: {
        widths: ['*', '*', '*'],
        body: [
          [
            {
              text: [
                { text: 'Empresa:\n', style: 'label' },
                { text: cliente.empresa || '-', style: 'value' },
              ],
              border: [false, false, false, false],
            },
            {
              text: [
                { text: 'Contacto:\n', style: 'label' },
                {
                  text: usuario.nombre || 'Sin solicitante',
                  style: 'value',
                },
              ],
              border: [false, false, false, false],
            },
            {
              text: [
                { text: 'Cargo:\n', style: 'label' },
                { text: usuario.cargo || '-', style: 'value' },
              ],
              border: [false, false, false, false],
            },
          ],
          [
            {
              text: [
                { text: 'RFC:\n', style: 'label' },
                { text: cliente.rfc || '-', style: 'value' },
              ],
              border: [false, false, false, false],
              margin: [0, 8, 0, 0],
            },
            {
              text: [
                { text: 'Teléfono:\n', style: 'label' },
                { text: usuario.telefono || '-', style: 'value' },
              ],
              border: [false, false, false, false],
              margin: [0, 8, 0, 0],
            },
            {
              text: [
                { text: 'Correo:\n', style: 'label' },
                {
                  text: (usuario.email || detalle.emailContacto || '-') as string,
                  style: 'value',
                },
              ],
              border: [false, false, false, false],
              margin: [0, 8, 0, 0],
            },
          ],
        ],
      },
      layout: 'noBorders',
      margin: [0, 6, 0, 14],
    },

    // Tabla de conceptos (título / columnas / layout A|B|C dinámicos)
    { text: conceptosTable.sectionTitle, style: 'sectionHeader' },
    {
      table: {
        headerRows: 1,
        dontBreakRows: conceptosTable.dontBreakRows,
        // Cantidad / Precio / Subtotal fijos para que montos ($ 1,400.00) no se partan
        widths: conceptosTable.widths,
        body: conceptosTable.body,
      },
      layout: 'lightHorizontalLines',
      margin: [0, 10, 0, 20],
    },

    // Totales
    {
      columns: [
        { width: '*', text: '' },
        {
          width: 200,
          table: {
            widths: ['*', 'auto'],
            body: agregarIva
              ? [
                  [
                    {
                      text: 'Subtotal:',
                      alignment: 'right',
                      style: 'totalLabel',
                    },
                    {
                      text: formatCurrency(detalle.total),
                      alignment: 'right',
                      style: 'totalValue',
                    },
                  ],
                  [
                    { text: 'IVA:', alignment: 'right', style: 'totalLabel' },
                    {
                      text: formatCurrency(iva),
                      alignment: 'right',
                      style: 'totalValue',
                    },
                  ],
                  [
                    {
                      text: 'TOTAL:',
                      alignment: 'right',
                      style: 'totalLabelBold',
                    },
                    {
                      text: formatCurrency(total),
                      alignment: 'right',
                      style: 'totalValueBold',
                    },
                  ],
                ]
              : [
                  [
                    {
                      text: 'TOTAL:',
                      alignment: 'right',
                      style: 'totalLabelBold',
                    },
                    {
                      text: formatCurrency(detalle.total),
                      alignment: 'right',
                      style: 'totalValueBold',
                    },
                  ],
                ],
          },
          layout: 'noBorders',
        },
      ],
    },
  ];

  // Story 6.7 / UX-DR12: cuerpo → plantillasSnapshot → bancarios
  const plantillasContent = mapPlantillasSnapshot(detalle.plantillasSnapshot);
  if (plantillasContent.length) {
    mainContent.push({ text: '', pageBreak: 'after' });
    mainContent.push(...plantillasContent);
  }

  if (incluirDatosBancarios && bankPage) {
    mainContent.push({ text: '', pageBreak: 'after' });
    mainContent.push(
      ...buildDatosBancariosPage({
        ...bankPage,
        brandingLogoBase64: logoBase64,
      }),
    );
  }

  return {
    pageSize: 'LETTER',
    pageMargins: [40, PDF_PAGE_MARGIN_TOP, 40, 60],

    header: (currentPage: number, pageCount: number) => {
      if (incluirDatosBancarios && currentPage === pageCount) {
        return { text: '', margin: [0, 0, 0, 0] };
      }
      return {
        columns: [
          {
            image: logoBase64,
            width: 75,
            margin: [40, 12, 0, 0],
          },
          {
            text: 'COTIZACIÓN',
            alignment: 'right',
            style: 'headerTitle',
            margin: [0, 22, 40, 0],
          },
        ],
      };
    },

    footer: (_currentPage: number, _pageCount: number) => {
      const stack: any[] = [{ text: footerLine1, style: 'footerText' }];
      if (footerLine2) {
        stack.push({ text: footerLine2, style: 'footerText' });
      }
      if (footerLine3) {
        stack.push({ text: footerLine3, style: 'footerText' });
      }
      return {
        columns: [
          {
            stack,
            alignment: 'center',
          },
        ],
        margin: [40, 0, 40, 0],
      };
    },

    content: mainContent,

    styles: {
      headerTitle: {
        fontSize: 18,
        bold: true,
        color: '#111827',
      },
      sectionHeader: {
        fontSize: 12,
        bold: true,
        color: '#374151',
        decoration: 'underline',
        margin: [0, 10, 0, 5],
      },
      tableHeader: {
        bold: true,
        fontSize: 10,
        color: '#000000',
        fillColor: '#F3F4F6',
        margin: [5, 5, 5, 5],
      },
      tableCell: {
        fontSize: 10,
        color: '#374151',
        margin: [5, 5, 5, 5],
      },
      paramLabel: {
        fontSize: 9,
        color: '#6B7280',
        bold: true,
      },
      paramValue: {
        fontSize: 10,
        color: '#111827',
      },
      label: {
        fontSize: 9,
        color: '#6B7280',
        bold: true,
      },
      value: {
        fontSize: 10,
        color: '#111827',
      },
      totalLabel: {
        fontSize: 10,
        bold: true,
        color: '#4B5563',
      },
      totalValue: {
        fontSize: 10,
        color: '#111827',
      },
      totalLabelBold: {
        fontSize: 12,
        bold: true,
        color: '#111827',
      },
      totalValueBold: {
        fontSize: 12,
        bold: true,
        color: '#111827',
      },
      footerText: {
        fontSize: 8,
        color: '#9CA3AF',
        margin: [0, 2],
      },
      bankSubtitle: {
        fontSize: 13,
        bold: true,
        alignment: 'center',
        color: '#111827',
      },
      bankLine: {
        fontSize: 10,
        color: '#111827',
        margin: [0, 3],
      },
      bankLink: {
        fontSize: 10,
        color: '#2563EB',
        decoration: 'underline',
      },
      plantillaNombre: {
        fontSize: 14,
        bold: true,
        color: '#111827',
      },
      plantillaSeccionTitulo: {
        fontSize: 11,
        bold: true,
        color: '#374151',
        decoration: 'underline',
      },
      plantillaTableHeader: {
        bold: true,
        fontSize: 10,
        color: '#000000',
        fillColor: '#F3F4F6',
        margin: [4, 4, 4, 4],
      },
      plantillaTableCell: {
        fontSize: 10,
        color: '#374151',
        margin: [4, 4, 4, 4],
      },
    },
  };
};

function getColorForEstado(estado: string): string {
  switch (estado) {
    case 'vigente':
      return '#059669'; // green-600
    case 'aceptada':
      return '#2563EB'; // blue-600
    case 'rechazada':
      return '#DC2626'; // red-600
    case 'vencida':
      return '#4B5563'; // gray-600
    case 'cancelada':
      return '#334155'; // slate-700
    default:
      return '#000000';
  }
}
