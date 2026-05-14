async function getModels() {
  const url = 'https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyDnXSA762zSuOzddUp7dkMpdHHlcFgQWdA';
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.models) {
      data.models.forEach(m => console.log(m.name));
    } else {
      console.log(data);
    }
  } catch (e) {
    console.error(e);
  }
}
getModels();
