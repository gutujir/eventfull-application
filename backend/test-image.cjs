
try {
  const fetch = require('node-fetch');
} catch (e) {
  // If node-fetch isn't available, we can't test easily in this environment without installing it.
  // But wait, we are in the backend folder, we might not have it.
  // We can use http module.
}

const http = require('http');

const filename = 'image-1770219042543-545655084.jpg'; // Pick one from ls output
const url = `http://localhost:3000/uploads/${filename}`;

console.log(`Testing URL: ${url}`);

http.get(url, (res) => {
  const { statusCode } = res;
  console.log(`Status Code: ${statusCode}`);
  if (statusCode === 200) {
    console.log('Image found!');
  } else {
    console.log('Image NOT found!');
  }
}).on('error', (e) => {
  console.error(`Got error: ${e.message}`);
});
