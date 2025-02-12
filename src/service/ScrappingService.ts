import axios from 'axios';
import * as cheerio from 'cheerio';

export async function ScrappingService(url: string): Promise<string> {
  try {
    if (!url) {
      throw new Error('Please provide a valid URL');
    }

    const isLocalhost = window.location.hostname === 'localhost';
    const baseUrl = isLocalhost ? `https://cors-anywhere.herokuapp.com/${url}` : url;
    const { data } = await axios.get(baseUrl);
    if (!data) {
      throw new Error('No HTML content received');
    }

    // Cargar el HTML en Cheerio
    const $ = cheerio.load(data);

    const sentence: string[] = [];

    const unwantedTexts = [
      'or',
      'New to LinkedIn? Join now',
      'By clicking Continue to join or sign in, you agree to LinkedIn’s User Agreement, Privacy Policy, and Cookie Policy.',
      'Password Show',
      'Show',
      'Forgot password? Sign in',
      'You may also apply directly on company website.',
      'By clicking Agree & Join, you agree to the LinkedIn User Agreement, Privacy Policy and Cookie Policy.',
      'Email',
      'Email Password (6+ characters)',
      'Password (6+ characters)',
      'Email or phone',
      'First name',
      'First name Last name',
      'Last name',
      'Security verification',
    ];

    sentence.push('RESUME: ');

    $('html body main section:nth-child(1) div div section div div section div').each(
      (_, element) => {
        const text_content = $(element).text().trim().replace(/\s+/g, ' ').trim();

        if (
          text_content.length > 0 &&
          !unwantedTexts.includes(text_content) &&
          !text_content.includes(' User Agreement, Privacy Policy, and Cookie Policy.')
        ) {
          sentence.push(text_content);
        }
      }
    );

    sentence.push('GENERAL RESPONSIBILITIES AND JOB REQUIREMENTS: ');

    $(
      'section:nth-child(1) section:nth-child(1) div:nth-child(1) div:nth-child(1) div:nth-child(1) p, section section:nth-child(1) div div div ul li, html body main section:nth-child(1) div div section div div section div strong'
    ).each((_, element) => {
      const text_content = $(element).text().trim().replace(/\s+/g, ' ').trim();

      if (
        text_content.length > 0 &&
        !unwantedTexts.includes(text_content) &&
        !text_content.includes(' User Agreement, Privacy Policy, and Cookie Policy.')
      ) {
        sentence.push(text_content);
      }
    });

    sentence.push('ADDITIONAL JOB DETAILS: ');
    $('ul.description__job-criteria-list li').each((_, element) => {
      const text_content = $(element).text().trim().replace(/\s+/g, ' ').trim();

      if (
        text_content.includes('Seniority level') ||
        text_content.includes('Employment ') ||
        text_content.includes('Job function ') ||
        text_content.includes('Industries :')
      ) {
        const replacements: Record<string, string> = {
          'Seniority level': 'Seniority level: ',
          Employment: 'Employment : ',
          'Job function': 'Job function : ',
          Industries: 'Industries : ',
        };

        sentence.push(
          text_content.replace(
            /Seniority level|Employment|Industries|Job function/,
            (match) => replacements[match]
          )
        );
      } else {
        sentence.push(text_content);
      }
    });

    return sentence.join('\n');
  } catch (error) {
    console.error('Error during scraping:', error);
    throw new Error('Failed to scrape the website');
  }
}
