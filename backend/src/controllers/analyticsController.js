const { getEntregaAnalytics } = require('../services/analyticsService');

async function getAnalytics(req, res, next) {
  try {
    const { lockerId, startDate, endDate } = req.query;
    
    console.log('📊 Buscando analytics:', { lockerId, startDate, endDate });
    
    const analytics = await getEntregaAnalytics({ 
      lockerId: lockerId || undefined, 
      startDate: startDate || undefined, 
      endDate: endDate || undefined 
    });
    
    console.log('✅ Analytics carregados');
    
    res.json({
      success: true,
      data: analytics
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar analytics:', error);
    next(error);
  }
}

module.exports = {
  getAnalytics
};
