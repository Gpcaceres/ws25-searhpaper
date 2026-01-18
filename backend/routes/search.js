const express = require('express');
const router = express.Router();
const plosService = require('../services/plosService');

/**
 * GET /api/search
 * Buscar papers en PLOS API
 * Query params:
 * - q: término de búsqueda (requerido)
 * - page: número de página (default: 1)
 * - rows: resultados por página (default: 10)
 */
router.get('/', async (req, res) => {
  try {
    const { q, page = 1, rows = 10 } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({ 
        error: 'Search query is required',
        message: 'Please provide a search term using the "q" parameter'
      });
    }

    const result = await plosService.searchPapers(q, parseInt(page), parseInt(rows));
    
    res.json(result);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Failed to search papers',
      message: error.message 
    });
  }
});

/**
 * GET /api/search/article/:doi
 * Obtener detalles de un artículo específico por DOI
 */
router.get('/article/:doi(*)', async (req, res) => {
  try {
    const doi = req.params.doi;
    
    if (!doi) {
      return res.status(400).json({ 
        error: 'DOI is required',
        message: 'Please provide a valid DOI'
      });
    }

    const article = await plosService.getArticleByDoi(doi);
    
    res.json(article);
  } catch (error) {
    console.error('Article fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch article',
      message: error.message 
    });
  }
});

module.exports = router;
