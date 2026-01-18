const axios = require('axios');

const PLOS_API_URL = process.env.PLOS_API_URL || 'https://api.plos.org/search';

/**
 * Buscar papers en PLOS API
 * @param {string} query - Término de búsqueda
 * @param {number} page - Número de página
 * @param {number} rows - Resultados por página
 * @returns {Promise<Object>} - Resultados de búsqueda con paginación
 */
async function searchPapers(query, page = 1, rows = 10) {
  try {
    const start = (page - 1) * rows;
    
    const params = {
      q: query,
      start: start,
      rows: rows,
      wt: 'json',
      fl: 'id,title,author,abstract,publication_date,journal,article_type,score'
    };

    const response = await axios.get(PLOS_API_URL, { params });
    
    const data = response.data.response;
    
    return {
      success: true,
      query: query,
      totalResults: data.numFound,
      page: page,
      rowsPerPage: rows,
      totalPages: Math.ceil(data.numFound / rows),
      papers: data.docs.map(doc => ({
        id: doc.id,
        doi: doc.id,
        title: doc.title,
        authors: doc.author || [],
        abstract: doc.abstract ? doc.abstract[0] : '',
        publicationDate: doc.publication_date,
        journal: doc.journal,
        articleType: doc.article_type,
        score: doc.score,
        downloadUrl: `https://journals.plos.org/plosone/article/file?id=${doc.id}&type=printable`,
        viewUrl: `https://journals.plos.org/plosone/article?id=${doc.id}`
      }))
    };
  } catch (error) {
    console.error('PLOS API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.msg || 'Failed to fetch papers from PLOS API');
  }
}

/**
 * Obtener detalles de un artículo específico por DOI
 * @param {string} doi - DOI del artículo
 * @returns {Promise<Object>} - Detalles del artículo
 */
async function getArticleByDoi(doi) {
  try {
    const params = {
      q: `id:"${doi}"`,
      wt: 'json',
      fl: 'id,title,author,abstract,publication_date,journal,article_type,body,references'
    };

    const response = await axios.get(PLOS_API_URL, { params });
    
    const data = response.data.response;
    
    if (data.numFound === 0) {
      throw new Error('Article not found');
    }

    const doc = data.docs[0];
    
    return {
      success: true,
      article: {
        id: doc.id,
        doi: doc.id,
        title: doc.title,
        authors: doc.author || [],
        abstract: doc.abstract ? doc.abstract[0] : '',
        publicationDate: doc.publication_date,
        journal: doc.journal,
        articleType: doc.article_type,
        downloadUrl: `https://journals.plos.org/plosone/article/file?id=${doc.id}&type=printable`,
        viewUrl: `https://journals.plos.org/plosone/article?id=${doc.id}`
      }
    };
  } catch (error) {
    console.error('PLOS API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.msg || 'Failed to fetch article from PLOS API');
  }
}

module.exports = {
  searchPapers,
  getArticleByDoi
};
