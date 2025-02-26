const form = document.forms.newsletter;

form.addEventListener('submit', onSubmit)

async function onSubmit(e) {
    e.preventDefault();

    const dataFromForm = new FormData(e.target);
    const { email, dataCheckbox } = Object.fromEntries(dataFromForm);

    const url = 'http://localhost:7001'
    try {
        if (email && dataCheckbox === "on") {
            const options = {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({ email, dataCheckbox })
            }

            const response = await fetch(`${url}/newsletter-anmeldung`, options)
            
            if(response.status !== 200){
                const error = await response.json()
                throw new Error(JSON.stringify(error.error))

            }
            const data = await response.json()
            console.log(data)

            // window.location.href

        }
    } catch (error) {
        const output = form.elements["error"];
        output.value = error
    }





}