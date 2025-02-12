
export const AGENCY_LOGOS = [
  {
    domain: 'proselect.be',
    logo: 'https://i.postimg.cc/tg2Xq57M/IMG-7594.png'
  },
  {
    domain: 'tempo-team.be',
    logo: 'https://i.postimg.cc/kX2ZPLhf/352321179-802641697768990-7499832421124251242-n-1.png'
  },
  {
    domain: 'adecco.be',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpHiI1ANEpe5BlJpLQDI_4M8jl1AnJciaqaw&s'
  },
  {
    domain: 'asap.be',
    logo: 'https://a.storyblok.com/f/118264/240x240/c475b21edc/asap-logo-2.png'
  },
  {
    domain: 'synergiejobs.be',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMXkqv_r78fpVwVE9xDY6rd0GfS3bMlK1sWA&s'
  },
  {
    domain: 'randstad.be',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQK5L2880dU-fMT-PjiSxVWWbwI6Vb8l3Vw6Q&s'
  },
  {
    domain: 'accentjobs.be',
    logo: 'https://i.postimg.cc/053yKcZg/IMG-7592.png'
  },
  {
    domain: 'startpeople.be',
    logo: 'https://media.licdn.com/dms/image/v2/D4E03AQGzYaEHyR2N_w/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1666681919673?e=2147483647&v=beta&t=oyXA1mGdfaPAMHB0YsV3dUAQEN0Ic0DfVltZaVtSywc'
  },
  {
    domain: 'dajobs.be',
    logo: 'https://i.postimg.cc/fL7Dcvyd/347248690-792113835829706-805731174237376164-n.png'
  },
  {
    domain: 'sdworx.jobs',
    logo: 'https://i.postimg.cc/XJ8FtyxC/339105639-183429217812911-8132452130259136190-n.png'
  },
  {
    domain: 'roberthalf.com',
    logo: 'https://i.postimg.cc/13vSMqjT/383209240-608879378108206-6829050048883403071-n.jpg'
  }
];

export const getDomainFromUrl = (url: string) => {
  try {
    const urlObject = new URL(url);
    return urlObject.hostname.replace('www2.', 'www.').replace('www.', '');
  } catch (error) {
    console.error('Error parsing URL:', error);
    return url;
  }
};

export const getLogoForUrl = (url: string) => {
  try {
    const domain = getDomainFromUrl(url);
    const agencyInfo = AGENCY_LOGOS.find(agency => domain.includes(agency.domain));
    return agencyInfo?.logo;
  } catch (error) {
    console.error('Error parsing URL:', error);
    return null;
  }
};
