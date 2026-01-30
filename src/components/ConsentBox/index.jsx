import { useEffect, useState } from 'react';
import Checkbox from '../Checkbox';
import Audio from '../Audio/index';
import LanguageDropDown from '../DropDown/LanguageDropDown';
import PropTypes from 'prop-types';
import consentEnglishAudioFile from '../../assets/audio/English.m4a';
import consentHindiAudioFile from '../../assets/audio/Hindi.mp3';
import consentGujaratiAudioFile from '../../assets/audio/Gujarati.mp3';
import consentMarathiAudioFile from '../../assets/audio/Marathi.mp3';
import consentTamilAudioFile from '../../assets/audio/Tamil.mp3';
import consentKannadaAudioFile from '../../assets/audio/Kannada.mp3';
import consentTeluguAudioFile from '../../assets/audio/Telugu.mp3';

const consentInMultipleLanguage = [
  {
    language: 'english',
    description:
      'I hereby consent to provide my Aadhaar Number and One Time Pin (OTP) data for Aadhaar based authentication for the purpose of establishing my identity and providing demographic details for the loan application. I have no objection in authenticating myself and fully understand that information provided by me shall be used for authenticating my identity through Aadhaar Authentication System for the purpose stated above and no other purpose.',
    audioFile: consentEnglishAudioFile,
    audioType: 'm4a',
  },
  {
    language: 'hindi',
    description:
      'मैं अपनी पहचान स्थापित करने और ऋण आवेदन के लिए जनसांख्यिकीय विवरण प्रदान करने के उद्देश्य से आधार आधारित प्रमाणीकरण के लिए अपना आधार नंबर और वन टाइम पिन (ओटीपी) डेटा प्रदान करने के लिए सहमति देता हूं। मुझे खुद को प्रमाणित करने में कोई आपत्ति नहीं है और मैं पूरी तरह से समझता हूं कि मेरे द्वारा प्रदान की गई जानकारी का उपयोग आधार प्रमाणीकरण प्रणाली के माध्यम से मेरी पहचान को प्रमाणित करने के लिए ऊपर बताए गए उद्देश्य के लिए किया जाएगा और किसी अन्य उद्देश्य के लिए नहीं किया जाएगा।',
    audioFile: consentHindiAudioFile,
    audioType: 'mp3',
  },
  {
    language: 'marathi',
    description:
      'माझी ओळख प्रस्थापित करण्याच्या उद्देशाने आणि कर्जाच्या अर्जासाठी लोकसंख्याशास्त्रीय तपशील प्रदान करण्याच्या उद्देशाने आधार आधार प्रमाणीकरणासाठी माझा आधार क्रमांक आणि वन टाइम पिन (OTP) डेटा प्रदान करण्यास मी याद्वारे संमती देतो. मला स्वत:चे प्रमाणीकरण करण्यास कोणताही आक्षेप नाही आणि मला पूर्णपणे समजले आहे की माझ्याद्वारे प्रदान केलेली माहिती वर नमूद केलेल्या उद्देशासाठी आधार प्रमाणीकरण प्रणालीद्वारे माझी ओळख प्रमाणित करण्यासाठी वापरली जाईल आणि इतर कोणत्याही हेतूसाठी वापरली जाईल.',
    audioFile: consentMarathiAudioFile,
    audioType: 'mp3',
  },
  {
    language: 'gujarati',
    description:
      'હું આથી મારી ઓળખ સ્થાપિત કરવા અને લોન અરજી માટે વસ્તી વિષયક વિગતો પ્રદાન કરવાના હેતુસર આધાર આધારિત પ્રમાણીકરણ માટે મારો આધાર નંબર અને વન ટાઈમ પિન (OTP) ડેટા પ્રદાન કરવા સંમતિ આપું છું. મને મારી જાતને પ્રમાણિત કરવામાં કોઈ વાંધો નથી અને હું સંપૂર્ણપણે સમજું છું કે મારા દ્વારા આપવામાં આવેલી માહિતીનો ઉપયોગ ઉપર જણાવેલ હેતુ માટે આધાર પ્રમાણીકરણ સિસ્ટમ દ્વારા મારી ઓળખને પ્રમાણિત કરવા માટે કરવામાં આવશે અને અન્ય કોઈ હેતુ માટે નહીં.',
    audioFile: consentGujaratiAudioFile,
    audioType: 'mp3',
  },
  {
    language: 'tamil',
    description:
      'எனது அடையாளத்தை நிறுவுவதற்கும், கடன் விண்ணப்பத்திற்கான மக்கள்தொகை விவரங்களை வழங்குவதற்கும் ஆதார் அடிப்படையிலான அங்கீகாரத்திற்கான எனது ஆதார் எண் மற்றும் ஒரு முறை பின் (OTP) தரவை வழங்க நான் இதன்மூலம் ஒப்புக்கொள்கிறேன். என்னை அங்கீகரிப்பதில் எனக்கு எந்த ஆட்சேபனையும் இல்லை, மேலும் நான் வழங்கிய தகவல்கள் ஆதார் அங்கீகார அமைப்பின் மூலம் எனது அடையாளத்தை அங்கீகரிப்பதற்காக மேலே குறிப்பிட்ட நோக்கத்திற்காக பயன்படுத்தப்படும் என்பதை முழுமையாக புரிந்துகொள்கிறேன்.',
    audioFile: consentTamilAudioFile,
    audioType: 'mp3',
  },
  {
    language: 'telugu',
    description:
      'నా గుర్తింపును స్థాపించడం మరియు రుణ దరఖాస్తు కోసం జనాభా వివరాలను అందించడం కోసం ఆధార్ ఆధారిత ప్రమాణీకరణ కోసం నా ఆధార్ నంబర్ మరియు వన్ టైమ్ పిన్ (OTP) డేటాను అందించడానికి నేను ఇందుమూలంగా సమ్మతిస్తున్నాను. నన్ను ప్రమాణీకరించడంలో నాకు ఎటువంటి అభ్యంతరం లేదు మరియు నేను అందించిన సమాచారం పైన పేర్కొన్న ప్రయోజనం కోసం ఆధార్ ప్రామాణీకరణ వ్యవస్థ ద్వారా నా గుర్తింపును ప్రామాణీకరించడానికి ఉపయోగించబడుతుందని మరియు ఇతర ప్రయోజనాల కోసం ఉపయోగించబడుతుందని పూర్తిగా అర్థం చేసుకున్నాను.',
    audioFile: consentTeluguAudioFile,
    audioType: 'mp3',
  },
  {
    language: 'kannada',
    description:
      'ನನ್ನ ಗುರುತನ್ನು ಸ್ಥಾಪಿಸುವ ಮತ್ತು ಸಾಲದ ಅರ್ಜಿಗೆ ಜನಸಂಖ್ಯಾ ವಿವರಗಳನ್ನು ಒದಗಿಸುವ ಉದ್ದೇಶಕ್ಕಾಗಿ ಆಧಾರ್ ಆಧಾರಿತ ದೃಢೀಕರಣಕ್ಕಾಗಿ ನನ್ನ ಆಧಾರ್ ಸಂಖ್ಯೆ ಮತ್ತು ಒನ್ ಟೈಮ್ ಪಿನ್ (OTP) ಡೇಟಾವನ್ನು ಒದಗಿಸಲು ನಾನು ಈ ಮೂಲಕ ಸಮ್ಮತಿಸುತ್ತೇನೆ. ನನ್ನನ್ನು ದೃಢೀಕರಿಸಲು ನನಗೆ ಯಾವುದೇ ಅಭ್ಯಂತರವಿಲ್ಲ ಮತ್ತು ನಾನು ಒದಗಿಸಿದ ಮಾಹಿತಿಯನ್ನು ಆಧಾರ್ ದೃಢೀಕರಣ ವ್ಯವಸ್ಥೆಯ ಮೂಲಕ ನನ್ನ ಗುರುತನ್ನು ದೃಢೀಕರಿಸಲು ಮೇಲೆ ತಿಳಿಸಲಾದ ಉದ್ದೇಶಕ್ಕಾಗಿ ಬಳಸಲಾಗುವುದು ಮತ್ತು ಬೇರೆ ಯಾವುದೇ ಉದ್ದೇಶಕ್ಕಾಗಿ ಬಳಸಲಾಗುವುದು ಎಂದು ಸಂಪೂರ್ಣವಾಗಿ ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದೇನೆ.',
    audioFile: consentKannadaAudioFile,
    audioType: 'mp3',
  },
];

const ConsentBox = ({ isChecked, setIsChecked, updateConsent, disabled }) => {
  const [seeMore, setSeeMore] = useState(false);
  const [language, setLanguage] = useState('english');
  const [consent, setConsent] = useState(
    consentInMultipleLanguage.find((info) => info.language === language),
  );

  useEffect(() => {
    const filteredConsent = consentInMultipleLanguage.find((info) => info.language === language);
    updateConsent(filteredConsent.description);
    setConsent(filteredConsent);
  }, [language]);

  const languageOptions = [
    {
      label: 'English',
      value: 'english',
    },
    {
      label: 'Hindi',
      value: 'hindi',
    },
    {
      label: 'Marathi',
      value: 'marathi',
    },
    {
      label: 'Gujarati',
      value: 'gujarati',
    },
    {
      label: 'Tamil',
      value: 'tamil',
    },
    {
      label: 'Telugu',
      value: 'telugu',
    },
    {
      label: 'Kannada',
      value: 'kannada',
    },
  ];

  return (
    <div>
      <div className='mb-3 flex justify-between items-center'>
        <p className='font-medium'>Consent</p>
        <LanguageDropDown
          options={languageOptions}
          defaultSelected={language}
          onChange={(language) => setLanguage(language)}
        />
      </div>
      <div className='border border-[##E8E8E8] p-3 rounded-lg'>
        <div className='flex mb-4'>
          <Checkbox
            isLarge
            name='consent'
            checked={isChecked}
            onTouchEnd={() => !disabled && setIsChecked(!isChecked)}
          />
          <div className='ml-2'>
            <p className={`${!seeMore ? 'line-clamp-2' : ''}  text-dark-grey text-xs`}>
              {consent.description}{' '}
            </p>
            <button
              className='text-primary-black font-semibold text-xs'
              onClick={() => setSeeMore(!seeMore)}
            >
              {seeMore ? 'show less' : 'see more...'}
            </button>
          </div>
        </div>
        <Audio label='Listen audio' audioFile={consent.audioFile} audioType={consent?.audioType} />
      </div>
    </div>
  );
};

export default ConsentBox;

ConsentBox.propTypes = {
  isChecked: PropTypes.bool,
  setIsChecked: PropTypes.func,
  updateConsent: PropTypes.func,
  disabled: PropTypes.bool,
};
