 import JSEncrypt from 'jsencrypt'
// 密钥对生成 http://web.chacuo.net/netrsakeypair; 把下面生成的公钥、私钥换成自己生成的即可
const publicKey = '-----BEGIN PUBLIC KEY-----\n' +
  'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCyLgUmnadEtYvOo7A2uWkgJVRY\n' +
  'U3xY7r92AwWQteLJ7+RYGCKOVks6hokbsyKdj4zzAdf6k5gnAzaljzZTdHYTJE/k\n' +
  'zSHUH9We8wzQZQxZV32W7Xn+175XWC8MyABwVO7P4f07r+MCHxmXQ2+mp7NaSbOt\n' +
  'B64mh1E33SWWrUKyYQIDAQAB\n' +
  '-----END PUBLIC KEY-----\n';//生成的公钥
 const publicKey1 = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDbBm6lmsvfQI7DpLSiTSOy+kfjyi/VcBklGAxEwZb5XbZ3WJXTlOUA2thXjjVg5v2zg9bbwQv2fSkiyK9P1g1JnmzA+yELK9bvmvDmEyxjVnHrgnh4o/E+sOGiBf3+zA1B8xZzEk11FAPOLF6WbHDR0ZL9vc4K9oCit02rETZw2QIDAQAB";//生成的公钥
const privateKey='-----BEGIN PRIVATE KEY-----\n' +
  'MIICeAIBADANBgkqhkiG9w0BAQEFAASCAmIwggJeAgEAAoGBALIuBSadp0S1i86j\n' +
  'sDa5aSAlVFhTfFjuv3YDBZC14snv5FgYIo5WSzqGiRuzIp2PjPMB1/qTmCcDNqWP\n' +
  'NlN0dhMkT+TNIdQf1Z7zDNBlDFlXfZbtef7XvldYLwzIAHBU7s/h/Tuv4wIfGZdD\n' +
  'b6ans1pJs60HriaHUTfdJZatQrJhAgMBAAECgYEAqoYSledxyvc4ixXrMiR2MLap\n' +
  'JzMXIYG0qPuxWtJH7t1wmsLWZ4S80JErLOBe844L5hHQotaYWlXf+ci6xFoEGSq9\n' +
  '+Cy0/H35h9E8bBXwyykZt+eRBC0wEUqrq3ML44BsH3jBmEev7gXwvGc/deyx8U5k\n' +
  'WP0rInyXhF176saQaQECQQDcGJxmQCg+prLUy+LfiKZcQG+kV6snNWwiOLYY+km7\n' +
  'vP1bv9N6H0QvGk5iijr1rs8XeIUyMraMzakwWV3JwV3xAkEAzz7yxqekmBxjh4t6\n' +
  '/Lig5XsEi9oKEMCyDsNWxDfduY8UFT/jdcAgeag/eHYvXXbr50yKoVbzGZyBCM2k\n' +
  'PGzrcQJBAK+l/HslzHhjdOiaZk7asVmCGxbe2DqMSeXtuHWqmVl4dAHazxzxAutM\n' +
  'ZS4C/xa/EYq7piDvk/w+zT1GtLCk3yECQEA/dooJXKhfXKefoQAJyK97pJwqeyZY\n' +
  'ZprXCeYIn68v4Pz5cm2Fo0uz0gFpOiPSgy2QeAWua+zLrODqx3iIF7ECQQDOFnVL\n' +
  'v7rP8fEe//unr1eXVUub8UG097J4aQK5JDsfLl5I4iBqsaAeijFxRRyihHnJYOrL\n' +
  '55voq/E0VW4pvBtb\n' +
  '-----END PRIVATE KEY-----\n';
const privateKey1 = "MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBANsGbqWay99AjsOktKJNI7L6R+PKL9VwGSUYDETBlvldtndYldOU5QDa2FeONWDm/bOD1tvBC/Z9KSLIr0/WDUmebMD7IQsr1u+a8OYTLGNWceuCeHij8T6w4aIF/f7MDUHzFnMSTXUUA84sXpZscNHRkv29zgr2gKK3TasRNnDZAgMBAAECgYEAxdjJmk56WvC2BYSCpxmHZeUvi1TYYLUiAZ/3dSRqfFdqu+QJc1bMhjkps+2BykbeZYpyS4/WfpIQ1prxwexZkrn5YTR36J+WfzKujI5/h0gO/oIhg028nXTMRSB/21w0sw8XpDRLpTAr3omld+9h7ECM4LhCyOqnvilG/TTetQECQQD9qJpY6Hc/qyeAc3Qp4YizEKJKBs4TL/pIV13rWQXB0dhorR9k1XIP/AVl5ub9qJbnwhKU2s1zHPH2Dy2RvbbTAkEA3Qv9ebS3PuzTIlFxpbYkOQJUflMzFDb6k897QweEIJR2QU0nEXKkqOdXEtXGlxOqTBgtjzJV8rZDo5veGpyGIwJABuKzxeQRkJ3hxZ/csGJZ5pp1/VJv959eyOXuO7w/5sH+gODqMD+HCB4MO3boIEyaRBJFlNrXpt9LRiWlVAZ1VwJAQV6LXlOgIV697ZcySbQ8sBNNU3JdV6wOnGmuZRsy6sOc2SDs3c8OfNi1Ol+38/Of2BMKXh+fpUBbbmXo3+vMCwJBAKp7eahwej8XMD6AcVLr8d9ebVH/qBEJRHTS8kfxk0zdbVr57axrZb0PpeuISuqLBrcZG/M5oPDzccFN+wTW8DE="
const publicArray = [publicKey,publicKey1]
const  privateArray = [privateKey,privateKey1]
// 加密
export function encrypt(txt,publicChose = 0) {
  const encryptor = new JSEncrypt();
  encryptor.sign()
  encryptor.setPublicKey(publicArray[publicChose]);// 设置公钥
  let psw = encryptor.encrypt(txt);
  return psw // 对数据进行加密
}
// 解密
export function decrypt(txt,privateChose = 0) {
  const encryptor = new JSEncrypt();
  encryptor.setPrivateKey(privateArray[privateChose]); // 设置私钥
  debugger
  let s = encryptor.decrypt(txt)// 对数据进行解密
  return s;
}
