
const GATEWAY = 'http://0.0.0.0:5501'

const jsonResponse = await fetch(`${GATEWAY}/forms/list`);

if (jsonResponse.status !== 200) {
    console.warn(`Error: ${jsonResponse.status}: ${await jsonResponse.text()} `)
} else {
    const jsonData = await jsonResponse.json()
    console.log(jsonData);
}
