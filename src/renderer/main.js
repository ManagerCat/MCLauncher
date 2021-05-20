const { ipcRenderer } = require("electron")

$("#btn").click(() => {
	ipcRenderer.send("launcher", [$("email").val(), $("email").val()])
})


