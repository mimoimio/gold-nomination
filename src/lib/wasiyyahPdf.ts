import { jsPDF } from 'jspdf';
import type { WasiyyahState } from '../types/wasiyyah';

export interface PewasiatProfile {
    full_name?: string;
    nric_number?: string;
    email?: string;
}

const DUTY_DEFINITIONS: { key: keyof WasiyyahState['duties']; label: string }[] = [
    { key: 'hold_HibahEmas', label: 'Memegang Hibah Emas untuk benefisiari Pewasiat' },
    { key: 'apply_probate', label: 'Membuat permohonan Geran Probet / Surat Kuasa Mentadbir di Mahkamah Tinggi' },
    { key: 'update_info', label: 'Mengumpul dan mengemaskinikan maklumat waris, harta dan hutang' },
    { key: 'pay_debts', label: 'Membayar kos pengurusan jenazah dan hutang' },
    { key: 'faraid_distribution', label: 'Pengagihan harta mengikut hukum Faraid bagi lebihan harta pusaka' },
    { key: 'child_guardian', label: 'Menjadi Penjaga dan Pemegang Amanah kepada anak bawah umur' },
];

const RELATIONSHIP_LABELS: Record<string, string> = {
    Spouse: 'Suami / Isteri',
    Child: 'Anak',
    Parent: 'Ibu / Bapa',
    Sibling: 'Adik-Beradik',
    Other: 'Lain-lain',
};

const PAGE_MARGIN = 15;
const BOTTOM_LIMIT = 20;

const text = (value?: string | null) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : '-';
};

const formatDate = (date: Date) => {
    const pad = (value: number) => value.toString().padStart(2, '0');
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
};

export function buildWasiyyahPdf(formData: WasiyyahState, pewasiat: PewasiatProfile = {}): jsPDF {
    const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - PAGE_MARGIN * 2;
    let cursorY = PAGE_MARGIN;

    const ensureSpace = (requiredHeight: number) => {
        if (cursorY + requiredHeight > pageHeight - BOTTOM_LIMIT) {
            doc.addPage();
            cursorY = PAGE_MARGIN;
        }
    };

    const writeParagraph = (
        value: string,
        options: { size?: number; bold?: boolean; indent?: number; gap?: number; color?: [number, number, number] } = {}
    ) => {
        const { size = 10, bold = false, indent = 0, gap = 2.5, color = [30, 30, 30] } = options;
        const lineHeight = Math.max(3.8, size * 0.45);

        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.setFontSize(size);
        doc.setTextColor(color[0], color[1], color[2]);

        const lines = doc.splitTextToSize(value, contentWidth - indent) as string[];
        lines.forEach((line) => {
            ensureSpace(lineHeight);
            doc.text(line, PAGE_MARGIN + indent, cursorY);
            cursorY += lineHeight;
        });
        cursorY += gap;
    };

    const writeSectionHeading = (title: string) => {
        ensureSpace(14);
        cursorY += 2;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(title, PAGE_MARGIN, cursorY);
        cursorY += 1.8;
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.3);
        doc.line(PAGE_MARGIN, cursorY, pageWidth - PAGE_MARGIN, cursorY);
        cursorY += 5;
    };

    const writeField = (label: string, value?: string | null, indent = 2) => {
        const labelText = `${label}:`;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        const labelWidth = Math.max(52, doc.getTextWidth(labelText) + 3);

        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(text(value), contentWidth - indent - labelWidth) as string[];
        const lineHeight = 4.6;
        ensureSpace(lines.length * lineHeight + 1);

        const startY = cursorY;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(90, 90, 90);
        doc.text(labelText, PAGE_MARGIN + indent, startY);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(20, 20, 20);
        lines.forEach((line, index) => doc.text(line, PAGE_MARGIN + indent + labelWidth, startY + index * lineHeight));

        cursorY = startY + lines.length * lineHeight + 1;
    };

    const writeSignatureRow = (items: { title: string; name?: string }[]) => {
        if (items.length === 0) return;

        const blockHeight = 26;
        ensureSpace(blockHeight + 2);

        const columnWidth = (contentWidth - 10 * (items.length - 1)) / items.length;
        items.forEach((item, index) => {
            const x = PAGE_MARGIN + index * (columnWidth + 10);
            const lineY = cursorY + 15;

            doc.setDrawColor(71, 85, 105);
            doc.setLineWidth(0.3);
            doc.line(x, lineY, x + columnWidth, lineY);

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(15, 23, 42);
            doc.text(item.title, x, lineY + 4.5);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.setTextColor(71, 85, 105);
            const nameText = item.name?.trim() ? `Nama: ${item.name.trim()}` : 'Nama: ____________________';
            const nameLines = doc.splitTextToSize(nameText, columnWidth) as string[];
            nameLines.forEach((line, lineIndex) => doc.text(line, x, lineY + 9 + lineIndex * 4));
        });

        cursorY += blockHeight;
    };

    const generatedAt = new Date();
    const reference = `WASI-${generatedAt.getTime().toString().slice(-8)}`;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.setTextColor(15, 23, 42);
    doc.text('DOKUMEN WASIYYAH', pageWidth / 2, cursorY + 2, { align: 'center' });
    cursorY += 9;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Platform KAB Gold - Pengurusan Pewarisan Uncang Emas', pageWidth / 2, cursorY, { align: 'center' });
    cursorY += 5;
    doc.text(
        `No. Rujukan: ${reference}    |    Tarikh Dijana: ${formatDate(generatedAt)}`,
        pageWidth / 2,
        cursorY,
        { align: 'center' }
    );
    cursorY += 4;

    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.6);
    doc.line(PAGE_MARGIN, cursorY, pageWidth - PAGE_MARGIN, cursorY);
    cursorY += 7;

    writeSectionHeading('BAHAGIAN A - MAKLUMAT PEWASIAT');
    writeField('Nama Penuh', pewasiat.full_name);
    writeField('No. Kad Pengenalan', pewasiat.nric_number);
    writeField('E-mel', pewasiat.email);
    writeField('Pelepasan Aset', formData.pewasiat.release_type);
    writeField('Peguam Penasihat', formData.pewasiat.use_yusuf_advisory ? 'Ya - Yusuf Advisory dilantik' : 'Tidak');

    writeSectionHeading('BAHAGIAN B - PELANTIKAN WASI');
    writeField('Kaedah Perlaksanaan', formData.wasi_execution);

    const activeWasi = formData.wasi_list
        .map((wasi, index) => ({ ...wasi, index }))
        .filter((wasi) => wasi.name.trim() !== '');

    if (activeWasi.length === 0) {
        writeParagraph('Tiada Wasi dilantik.');
    }
    activeWasi.forEach((wasi) => {
        writeParagraph(`Wasi ${wasi.index + 1}`, { bold: true, size: 10.5, gap: 1 });
        writeField('Nama Penuh', wasi.name);
        writeField('No. Kad Pengenalan', wasi.nric);
        writeField('Hubungan', RELATIONSHIP_LABELS[wasi.relationship] ?? wasi.relationship);
        writeField('No. Telefon', wasi.phone);
        writeField('E-mel', wasi.email);
        writeField('Alamat', wasi.address);
        cursorY += 2;
    });

    writeSectionHeading('BAHAGIAN C - MAKLUMAT ASET');
    writeField(
        'Uncang Emas',
        formData.aset.uncang_emas ? 'Dimasukkan ke dalam pentadbiran (minimum 10 gram)' : 'Tidak dimasukkan'
    );
    writeField(
        'Harta Lain',
        formData.aset.other_assets ? 'Dimasukkan - tertakluk kepada sistem Estate Planning berasingan' : 'Tidak dimasukkan'
    );

    writeSectionHeading('BAHAGIAN D - SENARAI WARIS');
    const activeWaris = formData.waris_list.filter((waris) => waris.name.trim() !== '');
    if (activeWaris.length === 0) {
        writeParagraph('Tiada waris didaftarkan.');
    }
    activeWaris.forEach((waris, index) => {
        writeParagraph(`Waris ${index + 1}`, { bold: true, size: 10.5, gap: 1 });
        writeField('Nama Penuh', waris.name);
        writeField('No. Kad Pengenalan', waris.nric);
        writeField('Hubungan', waris.relationship);
        writeField('No. Telefon', waris.phone);
        writeField('E-mel', waris.email);
        writeField('Alamat', waris.address);
        cursorY += 2;
    });

    writeSectionHeading('BAHAGIAN E - TUGASAN WASI');
    DUTY_DEFINITIONS.forEach((duty) => {
        const assigned = [...(formData.duties[duty.key] ?? [])]
            .sort((a, b) => a - b)
            .map((wasiIndex) => formData.wasi_list[wasiIndex]?.name.trim() || `Wasi ${wasiIndex + 1}`);
        writeParagraph(`${duty.label}: ${assigned.length ? assigned.join(', ') : 'Tiada'}`, { size: 9.5, gap: 1.5 });
    });

    writeSectionHeading('BAHAGIAN F - MAKLUMAT SAKSI');
    const activeSaksi = formData.saksi_list.filter((saksi) => saksi.name.trim() !== '');
    if (activeSaksi.length === 0) {
        writeParagraph('Tiada saksi didaftarkan.');
    }
    activeSaksi.forEach((saksi, index) => {
        writeParagraph(`Saksi ${index + 1}`, { bold: true, size: 10.5, gap: 1 });
        writeField('Nama Penuh', saksi.name);
        writeField('No. Kad Pengenalan', saksi.nric);
        writeField('Alamat', saksi.address);
        cursorY += 2;
    });

    writeSectionHeading('BAHAGIAN G - PENGESAHAN & TANDATANGAN');
    writeParagraph(
        'Dokumen ini adalah cetakan daripada sistem Wasiemas KAB Gold. Selaras dengan keperluan Akta Perdagangan Elektronik 2006, dokumen ini wajib dicetak, ditandatangani secara fizikal oleh Pewasiat di hadapan saksi, dan dimuat naik semula ke dalam sistem untuk pengesahan Admin (Maker-Checker).',
        { size: 9.5, color: [71, 85, 105] }
    );

    writeParagraph('Ditandatangani oleh Pewasiat:', { bold: true, size: 10, gap: 1 });
    writeSignatureRow([{ title: 'Tandatangan Pewasiat', name: pewasiat.full_name }]);

    if (activeWasi.length > 0) {
        writeParagraph('Ditandatangani oleh Wasi yang dilantik:', { bold: true, size: 10, gap: 1 });
        for (let i = 0; i < activeWasi.length; i += 2) {
            writeSignatureRow(
                activeWasi.slice(i, i + 2).map((wasi) => ({ title: `Wasi ${wasi.index + 1}`, name: wasi.name }))
            );
        }
    }

    writeParagraph('Disaksikan oleh:', { bold: true, size: 10, gap: 1 });
    if (activeSaksi.length === 0) {
        writeParagraph('Belum ada saksi didaftarkan.', { size: 9.5 });
    }
    for (let i = 0; i < activeSaksi.length; i += 2) {
        writeSignatureRow(
            activeSaksi
                .slice(i, i + 2)
                .map((saksi, offset) => ({ title: `Saksi ${i + offset + 1}`, name: saksi.name }))
        );
    }

    const totalPages = doc.getNumberOfPages();
    for (let page = 1; page <= totalPages; page += 1) {
        doc.setPage(page);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text(
            'Dokumen dijana secara automatik oleh sistem KAB Gold. Sah hanya dengan tandatangan fizikal.',
            PAGE_MARGIN,
            pageHeight - 10
        );
        doc.text(`Halaman ${page} daripada ${totalPages}`, pageWidth - PAGE_MARGIN, pageHeight - 10, { align: 'right' });
    }

    return doc;
}
