
import axios from "axios";
import * as cheerio from 'cheerio';

export const scrapeData = async (keyword) => {
    try {
        // Example target URL (You would replace this with actual site)
     //   const response = await axios.get(`https://www.google.com/search?lat=${lat}&lon=${lon}`);
    //https://www.google.com/search?q=iit+madras+chennai
    const response = await axios.get(`https://www.google.com/search?q=`+keyword)
        const html = response.data;
        console.log(html)
        const $ = cheerio.load(html);
    
        // Extract information (customize based on target website structure)
        const shops = [];
        $('.kp-wholepage-osrp').each((index, element) => {
         // const shopName = $(element).find('.shop-name').text();
          const address = $(element).find('.LrzXr').text()
          const rating = $(element).find('.Aq14fc').text();
      //    const reviews = $(element).find('.reviews').text();
          const image = $(element).find('.thumb g-img img').attr('src');
    
          shops.push({
            address,
          //  shopName,
            rating,
          //  reviews,
            image,
          });
        });
    
        return shops;
      } catch (error) {
        console.error('Error scraping data:', error);
        return [];
      }
}