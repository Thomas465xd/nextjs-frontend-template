import { Metadata } from 'next'
import TranslationsProvider from '@/components/providers/TranslationsProvider'
import initTranslations from '../i18n';

// Dynamic metadata with translations
export async function generateMetadata({ params } : { params: Promise<{ locale: string }>}): Promise<Metadata> {
    const { locale } = await params; 
    
    const namespaces = ["metadata"];
    const { t } = await initTranslations(locale, namespaces);

    return {
        title: t("title.home"),
        description: t("description.home"),
        openGraph: {
            title: t("title.home"),
            description: t("description.home"),
            locale: locale,
            type: 'website',
        },
    };
}

export default async function page({ params } : { params: Promise<{ locale: string }>}) {
    const { locale } = await params; 

    const namespaces = ["resume", "projects", "contact"]

    const { resources } = await initTranslations(locale, namespaces)

    return (
        <TranslationsProvider
            resources={resources}
            locale={locale}
            namespaces={namespaces}
        >
            <div className="">
                <p>Insert Content here!</p>
            </div>
        </TranslationsProvider>
    )
}
