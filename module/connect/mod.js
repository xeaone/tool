
/*
    license: MIT
    version: 3.6.5
    author: Alexander Elias
    repository: https://github.com/xeaone/tool
*/


// http-fetch:https://deno.land/std@0.213.0/encoding/_util.ts
var encoder = new TextEncoder();
function getTypeName(value) {
  const type = typeof value;
  if (type !== "object") {
    return type;
  } else if (value === null) {
    return "null";
  } else {
    return value?.constructor?.name ?? "object";
  }
}
function validateBinaryLike(source) {
  if (typeof source === "string") {
    return encoder.encode(source);
  } else if (source instanceof Uint8Array) {
    return source;
  } else if (source instanceof ArrayBuffer) {
    return new Uint8Array(source);
  }
  throw new TypeError(
    `The input must be a Uint8Array, a string, or an ArrayBuffer. Received a value of the type ${getTypeName(source)}.`
  );
}

// http-fetch:https://deno.land/std@0.213.0/encoding/base64.ts
var base64abc = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "+",
  "/"
];
function encodeBase64(data) {
  const uint8 = validateBinaryLike(data);
  let result = "", i;
  const l = uint8.length;
  for (i = 2; i < l; i += 3) {
    result += base64abc[uint8[i - 2] >> 2];
    result += base64abc[(uint8[i - 2] & 3) << 4 | uint8[i - 1] >> 4];
    result += base64abc[(uint8[i - 1] & 15) << 2 | uint8[i] >> 6];
    result += base64abc[uint8[i] & 63];
  }
  if (i === l + 1) {
    result += base64abc[uint8[i - 2] >> 2];
    result += base64abc[(uint8[i - 2] & 3) << 4];
    result += "==";
  }
  if (i === l) {
    result += base64abc[uint8[i - 2] >> 2];
    result += base64abc[(uint8[i - 2] & 3) << 4 | uint8[i - 1] >> 4];
    result += base64abc[(uint8[i - 1] & 15) << 2];
    result += "=";
  }
  return result;
}
function decodeBase64(b64) {
  const binString = atob(b64);
  const size = binString.length;
  const bytes = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    bytes[i] = binString.charCodeAt(i);
  }
  return bytes;
}

// http-fetch:https://deno.land/std@0.213.0/encoding/base64url.ts
function convertBase64ToBase64url(b64) {
  return b64.endsWith("=") ? b64.endsWith("==") ? b64.replace(/\+/g, "-").replace(/\//g, "_").slice(0, -2) : b64.replace(/\+/g, "-").replace(/\//g, "_").slice(0, -1) : b64.replace(/\+/g, "-").replace(/\//g, "_");
}
function encodeBase64Url(data) {
  return convertBase64ToBase64url(encodeBase64(data));
}

// jwt/mod.ts
var encoder2 = new TextEncoder();
async function jwt(header, payload, secret) {
  const encodedHeader = encodeBase64Url(JSON.stringify(header));
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const data = encoder2.encode(`${encodedHeader}.${encodedPayload}`);
  const cleanedKey = secret.replace(
    /^\n?-----BEGIN PRIVATE KEY-----\n?|\n?-----END PRIVATE KEY-----\n?$/g,
    ""
  );
  const decodedKey = decodeBase64(cleanedKey).buffer;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    decodedKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    true,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    { hash: { name: "SHA-256" }, name: "RSASSA-PKCS1-v1_5" },
    key,
    data
  );
  const encodedSignature = encodeBase64Url(signature);
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

// connect/mod.ts
var Google = class {
  #token;
  #expires;
  #project;
  #attempts = 10;
  #timeout = 1e3;
  #serviceAccountCredentials;
  #applicationDefaultCredentials;
  constructor(options) {
    this.#project = options?.project;
    this.#timeout = options?.timeout ?? this.#timeout;
    this.#attempts = options?.attempts ?? this.#attempts;
    this.#serviceAccountCredentials = options?.serviceAccountCredentials;
    this.#applicationDefaultCredentials = options?.applicationDefaultCredentials;
  }
  async #auth(attempts) {
    if (this.#expires && this.#expires >= Date.now())
      return;
    let response;
    if (this.#applicationDefaultCredentials) {
      response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        signal: AbortSignal.timeout(this.#timeout * attempts),
        body: new URLSearchParams(this.#applicationDefaultCredentials)
      });
    } else if (this.#serviceAccountCredentials) {
      const { client_email, private_key } = this.#serviceAccountCredentials;
      const iss = client_email;
      const iat = Math.round(Date.now() / 1e3);
      const exp = iat + 30 * 60;
      const aud = "https://oauth2.googleapis.com/token";
      const scope = "https://www.googleapis.com/auth/datastore";
      const assertion = await jwt({ typ: "JWT", alg: "RS256" }, { exp, iat, iss, aud, scope }, private_key);
      const grant_type = "urn:ietf:params:oauth:grant-type:jwt-bearer";
      response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        body: new URLSearchParams({ assertion, grant_type }),
        signal: AbortSignal.timeout(this.#timeout * attempts)
      });
    } else {
      try {
        response = await fetch(
          "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token",
          {
            method: "GET",
            headers: { "Metadata-Flavor": "Google" },
            signal: AbortSignal.timeout(this.#timeout * attempts)
          }
        );
      } catch (error) {
        if (error?.name !== "TimeoutError") {
          throw new Error("credentials required");
        } else {
          throw new Error(error.message, { cause: error });
        }
      }
    }
    if (response.status !== 200) {
      throw new Error(`${response.status} ${response.statusText} ${await response.text()}`);
    }
    const result = await response.json();
    this.#token = result.access_token;
    this.#expires = Date.now() + result.expires_in * 1e3;
  }
  applicationDefault(applicationDefaultCredentials) {
    this.#applicationDefaultCredentials = {
      ...applicationDefaultCredentials,
      grant_type: "refresh_token"
    };
    return this;
  }
  serviceAccount(serviceAccountCredentials) {
    this.#serviceAccountCredentials = { ...serviceAccountCredentials };
    return this;
  }
  /**
   * @description
   *      Initialize application default credentials with `gcloud auth application-default login`.
   *      This file should be created and will be used as the application credential:
   *      - Windows: %APPDATA%\gcloud\application_default_credentials.json
   *      - Linux/Mac: $HOME/.config/gcloud/application_default_credentials.json
   * @param credential
   */
  credential(credential) {
    if (credential === "meta") {
      return;
    } else if (credential === "application") {
      let file;
      try {
        const prefix = Deno.build.os === "windows" ? Deno.env.get("APPDATA") : `${Deno.env.get("HOME")}/.config`;
        file = Deno.readTextFileSync(
          `${prefix}/gcloud/application_default_credentials.json`
        );
      } catch {
        return;
      }
      const data = JSON.parse(file);
      this.#applicationDefaultCredentials = {
        ...data,
        grant_type: "refresh_token"
      };
    } else if (credential.type === "authorized_user") {
      this.applicationDefault(credential);
    } else if (credential.type === "service_account") {
      this.serviceAccount(credential);
    } else {
      throw new Error("credential option required");
    }
  }
  /**
   * @description
   * @param {String} data
   * @returns {Google}
   */
  project(data) {
    this.#project = data;
    return this;
  }
  /**
   * @description Sets the max request time. Defaults to 1000ms.
   * @param {Number} timeout The milliseconds for request a timeout.
   * @return {Google}
   */
  timeout(timeout) {
    this.#timeout = timeout;
    return this;
  }
  /**
   * @description Sets the max retry atttempts after request timeout. Defaults to 5.
   * @param {Number} attempts The amount of attempts for timeout retries.
   * @return {Google}
   */
  attempts(attempts) {
    this.#attempts = attempts;
    return this;
  }
  async fetch(input, init, attempts) {
    attempts = attempts || 1;
    try {
      if (!this.project) {
        const projectResponse = await fetch(
          "http://metadata.google.internal/computeMetadata/v1/project/project-id",
          {
            method: "GET",
            headers: { "Metadata-Flavor": "Google" },
            signal: AbortSignal.timeout(this.#timeout * attempts)
          }
        );
        this.#project = await projectResponse.text();
      }
      if (!this.#project)
        throw new Error("project required");
      await this.#auth(attempts);
      init = init ?? {};
      init.signal = AbortSignal.timeout(this.#timeout * attempts);
      const request = new Request(input, init);
      if (this.#token)
        request.headers.set("Authorization", `Bearer ${this.#token}`);
      const response = await fetch(request);
      return response;
    } catch (error) {
      if (error?.name === "TimeoutError" && attempts < this.#attempts) {
        return this.fetch(input, init, attempts + 1);
      } else if (error?.name === "TimeoutError") {
        return new Response(void 0, { status: 408, headers: { connection: "close" } });
      } else {
        throw new Error(error.message, { cause: error });
      }
    }
  }
};
var mod_default = {
  Google
};
export {
  mod_default as default
};
//# sourceMappingURL=mod.js.map
