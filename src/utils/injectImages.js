const fs = require('fs');
const path = require('path');

/**
 * Utilitário para injetar referências a imagens nas biografias
 * Detecta imagens nas pastas de fotografia e as adiciona às biografias correspondentes
 */

// Função para normalizar nomes para comparação
function normalizeName(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_\-\s]/g, '_')
    .replace(/.png|.jpg|.jpeg/gi, '');
}

// Função para extrair o nome da pessoa a partir do nome da biografia
function getNameFromBioFilename(filename) {
  // historia_nome_completo.md -> nome_completo
  const match = filename.match(/historia_(.+)\.md/);
  return match ? match[1] : null;
}

// Função para encontrar a imagem correspondente
function findImageForBio(bioName, imagePath) {
  try {
    const files = fs.readdirSync(imagePath);
    const normalizedBioName = normalizeName(bioName);

    for (const file of files) {
      const normalizedImageName = normalizeName(file);
      if (normalizedImageName === normalizedBioName) {
        return file;
      }
    }
  } catch (error) {
    console.error(`Erro ao procurar imagem para ${bioName}:`, error.message);
  }
  return null;
}

// Função para verificar se a biografia já tem uma imagem
function hasImage(bioContent) {
  return /<img\s+src/.test(bioContent);
}

// Função para injetar a imagem na biografia
function injectImageInBio(bioContent, imageName, imagePath, category) {
  // Se já tem imagem, não fazer nada
  if (hasImage(bioContent)) {
    return bioContent;
  }

  // Corrigir o caminho - se imagePath for um caminho, extrair apenas a categoria
  let cat = category;
  if (!cat || cat === 'undefined') {
    cat = imagePath.split('/').pop();
  }

  const imageUrl = `/fotografias/${cat}/${encodeURIComponent(imageName)}`;
  const alt = imageName.replace(/\.(png|jpg|jpeg)$/i, '');

  // Criar a tag de imagem
  const imageTag = `<img src="${imageUrl}" alt="${alt} - Retrato histórico" width="280" style="border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); display: block; margin: 16px 0;" />`;

  // Inserir após o primeiro título (##) ou após o primeiro parágrafo
  const lines = bioContent.split('\n');
  let insertPos = -1;

  // Procurar pela primeira seção de subtítulo (##)
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/^##\s+/)) {
      insertPos = i;
      break;
    }
  }

  // Se não encontrou ##, procurar pelo primeiro parágrafo vazio
  if (insertPos === -1) {
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '' && i > 2) {
        insertPos = i;
        break;
      }
    }
  }

  if (insertPos > 0) {
    lines.splice(insertPos, 0, '', imageTag, '');
    return lines.join('\n');
  }

  return bioContent;
}

// Função principal
function injectImagesIntoBios() {
  const biografiasDir = path.join(__dirname, '../../dados/biografias');
  const fotografiasDir = path.join(__dirname, '../../dados/fotografias');

  const categories = ['jogadores', 'presidentes', 'treinadores', 'outras_figuras'];
  let processedCount = 0;
  let updatedCount = 0;
  let errorCount = 0;

  console.log('🖼️  Iniciando injeção de imagens nas biografias...\n');

  for (const category of categories) {
    const biographiesPath = path.join(biografiasDir, category);
    const imagesPath = path.join(fotografiasDir, category);

    if (!fs.existsSync(biographiesPath)) {
      console.log(`⚠️  Pasta de biografias não encontrada: ${category}`);
      continue;
    }

    if (!fs.existsSync(imagesPath)) {
      console.log(`⚠️  Pasta de imagens não encontrada: ${category}`);
      continue;
    }

    const bioFiles = fs.readdirSync(biographiesPath).filter(f =>
      f.startsWith('historia_') && f.endsWith('.md')
    );

    console.log(`📂 Processando categoria: ${category} (${bioFiles.length} biografias)`);

    for (const bioFile of bioFiles) {
      try {
        const bioPath = path.join(biographiesPath, bioFile);
        let bioContent = fs.readFileSync(bioPath, 'utf-8');

        const bioName = getNameFromBioFilename(bioFile);
        if (!bioName) continue;

        // Se já tem imagem, pular
        if (hasImage(bioContent)) {
          console.log(`  ✅ ${bioFile} - já tem imagem`);
          processedCount++;
          continue;
        }

        // Procurar a imagem correspondente
        const imageName = findImageForBio(bioName, imagesPath);

        if (imageName) {
          // Injetar a imagem
          bioContent = injectImageInBio(bioContent, imageName, category);
          fs.writeFileSync(bioPath, bioContent, 'utf-8');
          console.log(`  ✨ ${bioFile} - imagem adicionada (${imageName})`);
          updatedCount++;
        } else {
          console.log(`  ⏭️  ${bioFile} - nenhuma imagem encontrada`);
        }

        processedCount++;
      } catch (error) {
        console.error(`  ❌ Erro ao processar ${bioFile}:`, error.message);
        errorCount++;
      }
    }

    console.log('');
  }

  console.log('\n📊 Resumo da operação:');
  console.log(`   Biografias processadas: ${processedCount}`);
  console.log(`   Biografias atualizadas: ${updatedCount}`);
  console.log(`   Erros encontrados: ${errorCount}`);
  console.log('');

  if (updatedCount > 0) {
    console.log('✅ Injeção de imagens concluída com sucesso!');
  } else {
    console.log('ℹ️  Nenhuma biografia foi atualizada (todas já têm imagens ou não há imagens correspondentes).');
  }
}

// Exportar função
module.exports = {
  injectImagesIntoBios,
  injectImageInBio,
  findImageForBio,
  normalizeName,
  getNameFromBioFilename,
  hasImage
};

// Se chamado diretamente
if (require.main === module) {
  injectImagesIntoBios();
}
