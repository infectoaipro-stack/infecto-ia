import { test, expect } from '@playwright/test';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import mammoth from 'mammoth';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const TITLES = [
  'DADOS DO PACIENTE', 'PRECAUÇÕES', 'HIPÓTESES DIAGNÓSTICAS',
  'COMORBIDADES', 'HÁBITOS DO PACIENTE', 'EXAMES COMPLEMENTARES',
  'ANTIMICROBIANOS ATUAIS E ANTERIORES', 'DISPOSITIVOS IMPLANTADOS',
  'SINAIS, SINTOMAS E ACHADOS AO EXAME FÍSICO',
  'HISTÓRIA DA DOENÇA ATUAL (HDA)', 'INTERPRETAÇÃO MICROBIOLÓGICA',
  'JUSTIFICATIVA TERAPÊUTICA', 'CONDUTA INFECTOLÓGICA',
  'OPINIÃO DO INFECTOLOGISTA', 'REFERÊNCIAS',
];

test('importa DOCX sintético, distribui 15 tópicos e exporta Word institucional', async ({ page }) => {
  const paragraphs = TITLES.flatMap((title, i) => [
    new Paragraph({ children: [new TextRun(`${i + 1}. ${title}`)] }),
    new Paragraph(i === 6
      ? 'Meropenem 1 g EV 8/8 h, início 20/10/2026, para tratamento de pneumonia; uso atual, sujeito a revisão médica.'
      : `DADO FICTÍCIO DE TESTE ${i + 1}.`),
  ]);
  const buffer = await Packer.toBuffer(new Document({ sections: [{ children: paragraphs }] }));
  await page.goto('/');
  await page.locator('input[type=file]').setInputFiles({
    name: 'parecer_sintetico.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    buffer,
  });
  await expect(page.getByRole('status')).toContainText('15 seções reconhecidas');
  await expect(page.locator('section').nth(1).locator('textarea').nth(6)).toHaveValue(/Meropenem 1 g EV/);
  await expect(page.getByText('Tópicos preenchidos: 15/15')).toBeVisible();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Exportar Word para revisão' }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/\.docx$/);
  const filePath = await download.path();
  const text = (await mammoth.extractRawText({ buffer: await readFile(filePath) })).value;
  for (let i = 0; i < TITLES.length; i++) {
    expect(text).toContain(`${i + 1}. ${TITLES[i]}`);
  }
  expect(text).toContain('MEROPENEM 1 G EV 8/8 H');
  const xml = execFileSync('unzip', ['-p', filePath, 'word/document.xml'], { encoding: 'utf8' });
  const footer = execFileSync('unzip', ['-p', filePath, 'word/footer1.xml'], { encoding: 'utf8' });
  expect((xml.match(/<w:top\b/g) || []).length).toBe(14);
  expect(footer).toContain('INFECTO IA');
  expect(footer).toContain('REVISÃO MÉDICA');
  expect(execFileSync('unzip', ['-p', filePath, 'word/styles.xml'], { encoding: 'utf8' })).toContain('Calibri');
});

test('bloqueia exportação de parecer vazio e acima de 830 palavras', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Exportar Word para revisão' }).click();
  await expect(page.getByRole('status')).toContainText('nenhum tópico preenchido');
  await page.locator('section').nth(1).locator('textarea').first().fill('TESTE '.repeat(850));
  await page.getByRole('button', { name: 'Exportar Word para revisão' }).click();
  await expect(page.getByRole('status')).toContainText('acima de 830 palavras');
});
