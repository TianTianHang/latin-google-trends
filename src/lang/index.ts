import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { resources } from '@/lang/resources';

i18n
	.use(LanguageDetector)
	// 将 i18n 实例传递给 react-i18next
	.use(initReactI18next)
	// 初始化 i18next
	// 所有配置选项: https://www.i18next.com/overview/configuration-options
	.init({
		resources,
		fallbackLng: "zh",
		lng: navigator.language,
		debug: true,
		interpolation: {
			escapeValue: false, // not needed for react as it escapes by default
		}
	});

export default i18n;
