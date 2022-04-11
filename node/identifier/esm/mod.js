import * as dntShim from "./_dnt.shims.js";
export default function () {
    return dntShim.crypto.randomUUID();
}
