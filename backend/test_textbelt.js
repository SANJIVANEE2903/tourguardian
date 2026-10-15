const axios = require('axios');

(async () => {
  try {
    const response = await axios.post('https://textbelt.com/text', {
      phone: '+918208101532',
      message: 'Test SMS from TourGuardian Textbelt!',
      key: 'textbelt',
    });
    console.log(response.data);
  } catch (e) {
    console.error(e.message);
  }
})();
