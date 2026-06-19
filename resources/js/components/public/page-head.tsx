import { Head } from '@inertiajs/react';

interface PageHeadProps {
    title: string;
}

export default function PageHead({ title }: PageHeadProps) {
    return (
        <Head title={title}>
            <link rel="preconnect" href="https://fonts.bunny.net" />
            <link
                href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                rel="stylesheet"
            />
        </Head>
    );
}