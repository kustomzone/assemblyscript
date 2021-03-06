import {
  HEADER_SIZE as HEADER_SIZE_STR
} from "./string";

/** Computes the 32-bit hash of a value of any type. */
@inline
export function hash<T>(key: T): u32 {
  // branch-level tree-shaking makes this a `(return (call ...))`
  if (isString(key)) {
    return hashStr(key);
  } else if (isReference<T>()) {
    if (sizeof<T>() == 4) return hash32(changetype<u32>(key));
    if (sizeof<T>() == 8) return hash64(changetype<u64>(key));
  } else if (isFloat<T>()) {
    if (sizeof<T>() == 4) return hash32(reinterpret<u32>(key));
    if (sizeof<T>() == 8) return hash64(reinterpret<u64>(key));
  } else {
    if (sizeof<T>() == 1) return hash8 (<u32>key);
    if (sizeof<T>() == 2) return hash16(<u32>key);
    if (sizeof<T>() == 4) return hash32(<u32>key);
    if (sizeof<T>() == 8) return hash64(<u64>key);
  }
  unreachable();
}

// FNV-1a 32-bit as a starting point, see: http://isthe.com/chongo/tech/comp/fnv/

const FNV_OFFSET: u32 = 2166136261;
const FNV_PRIME: u32 = 16777619;

function hash8(key: u32): u32 {
  return (FNV_OFFSET ^ key) * FNV_PRIME;
}

function hash16(key: u32): u32 {
  var v = FNV_OFFSET;
  v = (v ^ ( key        & 0xff)) * FNV_PRIME;
  v = (v ^ ( key >>  8        )) * FNV_PRIME;
  return v;
}

function hash32(key: u32): u32 {
  var v = FNV_OFFSET;
  v = (v ^ ( key        & 0xff)) * FNV_PRIME;
  v = (v ^ ((key >>  8) & 0xff)) * FNV_PRIME;
  v = (v ^ ((key >> 16) & 0xff)) * FNV_PRIME;
  v = (v ^ ( key >> 24        )) * FNV_PRIME;
  return v;
}

function hash64(key: u64): u32 {
  var l = <u32> key;
  var h = <u32>(key >>> 32);
  var v = FNV_OFFSET;
  v = (v ^ ( l        & 0xff)) * FNV_PRIME;
  v = (v ^ ((l >>  8) & 0xff)) * FNV_PRIME;
  v = (v ^ ((l >> 16) & 0xff)) * FNV_PRIME;
  v = (v ^ ( l >> 24        )) * FNV_PRIME;
  v = (v ^ ( h        & 0xff)) * FNV_PRIME;
  v = (v ^ ((h >>  8) & 0xff)) * FNV_PRIME;
  v = (v ^ ((h >> 16) & 0xff)) * FNV_PRIME;
  v = (v ^ ( h >> 24        )) * FNV_PRIME;
  return v;
}

function hashStr(key: string): u32 {
  var v = FNV_OFFSET;
  for (let i: usize = 0, k: usize = key.length << 1; i < k; ++i) {
    v = (v ^ <u32>load<u8>(changetype<usize>(key) + i, HEADER_SIZE_STR)) * FNV_PRIME;
  }
  return v;
}
