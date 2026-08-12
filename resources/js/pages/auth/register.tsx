import { Head } from '@inertiajs/react';

import TextLink from '@/components/text-link';
import { login } from '@/routes';

export default function Register() {
    return (
        <>
            <Head title="Registration Disabled" />

            <div className="text-center text-sm text-muted-foreground">
                Public account registration is disabled.{' '}
                <TextLink href={login()}>Go to admin login</TextLink>
            </div>
        </>
    );
}

Register.layout = {
    title: 'Registration disabled',
    description: 'Admin accounts are created through the production seeder.',
};
