import * as jose from 'https://deno.land/x/jose@v5.0.1/index.ts';

/**
 * @link https://docs.snowflake.com/en/developer-guide/sql-api/authenticating
 *
 * Key Pair Tutorial
 * @link https://docs.snowflake.com/en/developer-guide/sql-api/authenticating#using-key-pair-authentication
 *
 * Create Private Key
 * @link https://docs.snowflake.com/en/user-guide/key-pair-auth#step-1-generate-the-private-key
 *
 * Create Public Key
 * @link https://docs.snowflake.com/en/developer-guide/sql-api/authenticating#using-key-pair-authentication
 *
 * Create NodeJs JWT
 * @link https://docs.snowflake.com/en/_downloads/f9ab0412f4093929578d63b5096a83c3/sql-api-generate-jwt.js
 *
 * snowsql -a "" -u "" --private-key-path .ssh/_rsa_key.p8
 */

// const encoder = new TextEncoder();
// const decoder = new TextDecoder();
// const createSnowflakeFingerPrint = async (key: string) => {

//     // key = key.replace('-----BEGIN PUBLIC KEY-----', '');
//     // key = key.replace('-----END PUBLIC KEY-----\n', '');

//     // key = key.replace('-----BEGIN PUBLIC KEY-----\n', '');
//     // key = key.replace('-----END PUBLIC KEY-----\n', '');

//     // key = key.replace('-----BEGIN PUBLIC KEY-----\n', '');
//     // key = key.replace('\n-----END PUBLIC KEY-----\n', '');

//     // key = key.replace(/\n$/, '');

//     // console.log(key);

//     const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(key));

//     // const hashBytes = decoder.decode(buffer);
//     // const hashUtf8 = String.fromCharCode(...encoder.encode(hashBytes));

//     // const bytes = decoder.decode(buffer);

//     const bytes = new Uint8Array(buffer);
//     const binary = String.fromCodePoint(...bytes);

//     console.log(encodeBase64(binary));
//     console.log(encodeBase64(buffer));
//     console.log(btoa(binary));

// };

// console.log(await createSnowflakeFingerPrint(snowflakePublicKey));
// console.log(await createSnowflakeFingerPrint());
// throw 'stop';

type Options = {
    cloud: string;
    locator: string;
    region: string;

    // publicKey: string,
    privateKey: string;
    fingerPrint: string;

    account: string;
    user: string;
    organization: string;

    timeout?: number; // 60

    schema: string;
    role: string;
    warehouse: string;
    database: string;

    userAgent?: string; // x-tool
};

/**
 * @example
 * ```
 *  const options = { ...};
 *  const statement = 'SELECT users.id FROM users;';
 *  const results = await execute<[id: string ][]>(options, statement);
 *  return results.map(([ id ]) => ({ id }));
 * ```
 * @param options
 * @param statement
 * @returns
 */

export const execute = async <T extends string[][]>(options: Options, statement: string): Promise<T> => {
    const cloud = options.cloud;
    const locator = options.locator;
    const region = options.region;

    const account = options.account;
    const user = options.user;
    const organization = options.organization;

    const base = `https://${locator}.${region}.${cloud}.snowflakecomputing.com`;

    const alg = 'RS256';
    const iat = Date.now();
    const exp = iat + (1000 * 60);

    // const publicKey = options.publicKey;
    const privateKey = await jose.importPKCS8(options.privateKey, alg);
    const fingerPrint = options.fingerPrint;

    const sub = `${organization}-${account}.${user}`;
    const iss = `${organization}-${account}.${user}.SHA256:${fingerPrint}`;
    const payload = { alg, iss, sub, iat, exp };

    const jwt = await new jose.SignJWT(payload)
        .setProtectedHeader(payload)
        .sign(privateKey);

    const body = {
        statement,
        timeout: options.timeout ?? 60,
        schema: options.schema,
        role: options.role,
        warehouse: options.warehouse,
        database: options.database,
    };

    const path = '/api/v2/statements';
    const url = new URL(path, base);

    const result = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'User-Agent': options.userAgent ?? 'x-tool',
            'Accept': 'application/json',
            'Authorization': `Bearer ${jwt}`,
            'Content-Type': 'application/json',
            'X-Snowflake-Authorization-Token-Type': 'KEYPAIR_JWT',
        },
    });

    if (result.status !== 200) {
        throw new Error(`${result.status} ${result.statusText} ${await result.text()}`);
    }

    return (await result.json()).data;
};

export default { execute };
