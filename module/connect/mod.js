
/*
    license: MIT
    version: 3.5.3
    author: Alexander Elias
    repository: https://github.com/xeaone/tool
*/


// http-fetch:https://deno.land/std@0.180.0/encoding/base64.ts
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
function encode(data) {
  const uint8 = typeof data === "string" ? new TextEncoder().encode(data) : data instanceof Uint8Array ? data : new Uint8Array(data);
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
function decode(b64) {
  const binString = atob(b64);
  const size = binString.length;
  const bytes = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    bytes[i] = binString.charCodeAt(i);
  }
  return bytes;
}

// http-fetch:https://deno.land/std@0.180.0/encoding/base64url.ts
function convertBase64ToBase64url(b64) {
  return b64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function encode2(data) {
  return convertBase64ToBase64url(encode(data));
}

// jwt/mod.ts
var encoder = new TextEncoder();
async function mod_default(header, payload, secret) {
  const encodedHeader = encode2(JSON.stringify(header));
  const encodedPayload = encode2(JSON.stringify(payload));
  const data = encoder.encode(`${encodedHeader}.${encodedPayload}`);
  const cleanedKey = secret.replace(
    /^\n?-----BEGIN PRIVATE KEY-----\n?|\n?-----END PRIVATE KEY-----\n?$/g,
    ""
  );
  const decodedKey = decode(cleanedKey).buffer;
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
  const encodedSignature = encode2(signature);
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

// connect/mod.ts
var Google = class {
  #token;
  #expires;
  #project;
  #serviceAccountCredentials;
  #applicationDefaultCredentials;
  constructor(options) {
    this.#project = options?.project;
    this.#serviceAccountCredentials = options?.serviceAccountCredentials;
    this.#applicationDefaultCredentials = options?.applicationDefaultCredentials;
  }
  async #auth() {
    if (this.#expires && this.#expires >= Date.now())
      return;
    let response;
    if (this.#applicationDefaultCredentials) {
      response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        body: new URLSearchParams(this.#applicationDefaultCredentials)
      });
    } else if (this.#serviceAccountCredentials) {
      const { client_email, private_key } = this.#serviceAccountCredentials;
      const iss = client_email;
      const iat = Math.round(Date.now() / 1e3);
      const exp = iat + 30 * 60;
      const aud = "https://oauth2.googleapis.com/token";
      const scope = "https://www.googleapis.com/auth/datastore";
      const assertion = await mod_default({ typ: "JWT", alg: "RS256" }, {
        exp,
        iat,
        iss,
        aud,
        scope
      }, private_key);
      const grant_type = "urn:ietf:params:oauth:grant-type:jwt-bearer";
      response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        body: new URLSearchParams({ assertion, grant_type })
      });
    } else {
      try {
        response = await fetch(
          "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token",
          {
            method: "GET",
            headers: { "Metadata-Flavor": "Google" }
          }
        );
      } catch {
        throw new Error("credentials required");
      }
    }
    const result = await response.json();
    if (result.error) {
      throw new Error(JSON.stringify(result.error, null, "	"));
    }
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
      this.applicationDefault(
        credential
      );
    } else if (credential.type === "service_account") {
      this.serviceAccount(credential);
    } else {
      throw new Error("credential option required");
    }
  }
  project(data) {
    this.#project = data;
    return this;
  }
  async fetch(input, init) {
    if (!this.project) {
      const method = "GET";
      const headers = new Headers({
        "Metadata-Flavor": "Google"
      });
      const projectResponse = await fetch(
        "http://metadata.google.internal/computeMetadata/v1/project/project-id",
        { method, headers }
      );
      this.#project = await projectResponse.text();
    }
    if (!this.#project)
      throw new Error("project required");
    await this.#auth();
    const request = new Request(input, init);
    if (this.#token) {
      request.headers.set("Authorization", `Bearer ${this.#token}`);
    }
    const response = await fetch(request);
    return response;
  }
};
var mod_default2 = {
  Google
};
export {
  mod_default2 as default
};
//# sourceMappingURL=mod.js.map
