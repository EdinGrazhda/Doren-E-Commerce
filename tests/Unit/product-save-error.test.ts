import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
    productSaveHttpError,
    productSaveRequestError,
} from '../../resources/js/lib/product-save-error.ts';

test('hosting HTML errors preserve their HTTP status and actionable explanation', () => {
    for (const [status, expected] of [
        [413, 'request-size limit'],
        [419, 'security token expired'],
        [403, 'request was denied'],
        [500, 'server logs'],
    ] as const) {
        const message = productSaveHttpError({
            status,
            data: '<html>Hosting error</html>',
        });
        assert.ok(message.includes(`HTTP ${status}`));
        assert.ok(message.includes(expected));
        assert.ok(!message.includes('<html>'));
    }
});

test('known server failures expose a safe explanation and log reference', () => {
    const reference = '12345678-1234-4234-8234-123456789012';
    const message = productSaveHttpError({
        status: 500,
        data: JSON.stringify({
            code: 'image_storage_failed',
            reference,
            message: 'private SQL/password',
        }),
    });
    assert.ok(message.includes('storage permissions'));
    assert.ok(message.includes(reference));
    assert.ok(!message.includes('private SQL/password'));
    assert.ok(message.includes('before retrying'));
});

test('unexpected JSON and inherited code names cannot override safe messages', () => {
    for (const data of [
        'null',
        '42',
        '[]',
        '{"code":"toString"}',
        '{"code":"__proto__"}',
    ]) {
        assert.ok(
            productSaveHttpError({ status: 500, data }).includes('server logs'),
        );
    }
});

test('network, cancellation and invalid JSON failures are distinguished without exposing raw errors', () => {
    for (const [name, expected] of [
        ['HttpNetworkError', 'No response was received'],
        ['HttpCancelledError', 'interrupted'],
        ['SyntaxError', 'unexpected response'],
        ['Error', 'unexpected error'],
    ]) {
        const error = new Error('private response body');
        error.name = name;
        const message = productSaveRequestError(error);
        assert.ok(message.includes(expected));
        assert.ok(message.includes('before retrying'));
        assert.ok(!message.includes('private response body'));
    }
});
