import {choc, set_content, on, DOM} from "https://rosuav.github.io/choc/factory.js";
const {BUTTON, FIELDSET, FIGCAPTION, FIGURE, FORM, H2, IMG, INPUT, LABEL, LEGEND, LI, P, SECTION, UL} = choc; //autoimport

// TODO return user orgs on login. For now, hardcode the org ID.
let org_id;
let user = JSON.parse(localStorage.getItem("user") || "{}");


export function socket_auth() {
	return user?.token;
}

const localState = {
	templates: [],
	current_template: null,
	pages: [],
};

function signatory_fields(template) {
	return FIELDSET([
		LEGEND("Potential Signatories"),
		UL({class: 'signatory_fields'}, [
			template.signatories?.map(
				(field) => LI(
					LABEL(INPUT({class: 'signatory-field', 'data-id': field.id, type: 'text', value: field.signatory_field})),
				)
			),
			LI(
				LABEL(INPUT({class: 'signatory-field', type: 'text', value: ''})),
			)
		])
	]);
}

function template_thumbnails() {
	return localState.pages.map(
			(url, idx) => LI(
				FIGURE([
					IMG({src: url, alt: "Page " + (idx + 1)}),
					FIGCAPTION(["Page: ", (idx + 1)])
				])
			)
		)
};

function hellobutton() {
	return BUTTON({class: 'hello', }, "Hello");
}

export function render(state) {
	console.log("Rendering with state", state);
		if (!user?.token) {
			return set_content("header",
				FORM({id:"loginform"}, [
					LABEL([
						"Email: ", INPUT({name: "email"})
					]),
					LABEL([
						"Password: ", INPUT({type: "password", name: "password"})
					]),
					BUTTON("Log in"),
					hellobutton(),
				])
			);
		} // no user token end
		set_content("header", ["Welcome, ", user.email, " ", BUTTON({id: "logout"}, "Log out"), hellobutton()]);
	if (state.page_count) {
		console.log("Rendering template", state);
			set_content("main", SECTION([
				H2(state.name),
				localState.page ?
					P("Current page: " + localState.page)
					:
				[signatory_fields(state),
						UL({id: 'template_thumbnails'}, [
							template_thumbnails(),
						]),
				]
			]));
	}
	if (state.templates) {
			set_content("main", SECTION([
				FORM({id: "template_submit"},[
					INPUT({value: "", id: "newTemplateName"}),
					INPUT({id: "blankcontract", type: "file", accept: "image/pdf"}),
					INPUT({type: "submit", value: "Upload"}),
				]),
				UL(
					state.templates.map((template) => LI({'class': 'specified-template', 'data-name': template.name, 'data-id': template.id},
						[template.name, " (", template.page_count, ")"]
						) // close LI
					) // close map
				) // close UL
			]))

		}; // end if state template_pages (or template listing)

}


const fetch_templates = async (org_id) => {
	//console.log("Fetching templates for org", org_id);
	const response = await fetch("/orgs/" + org_id + "/templates", {
		headers: {
			Authorization: "Bearer " + user.token
		}
	});
	const templates = await response.json();
	//console.log("Templates are", templates, org_id);
	localState.templates = templates;
}

if (user.token) {
	get_user_details();
}

async function update_template_details(id) {
	ws_sync.reconnect(null, ws_group = `${org_id}:${id}`);
	console.log("Fetching template details for GROUP", ws_group);
	localState.pages = [];
	const resp = await fetch(`/orgs/${org_id}/templates/${id}/pages`, {
		headers: {
			Authorization: "Bearer " + user.token
		}
	});
	localState.pages = await resp.json();
	set_content("#template_thumbnails", template_thumbnails());
}

const params = new URLSearchParams(window.location.hash.slice(1));

async function get_user_details() {
	if (!user.token) {
		return;
	}
	const userDetailsReq = await fetch("/user", {
		headers: {
			Authorization: "Bearer " + user.token
		}
	});
	const userDetails = await userDetailsReq.json();
	org_id = userDetails.primary_org;
	if (params.get("template")) {
		update_template_details(params.get("template"), params.get("page"));
	} else {
		ws_sync.reconnect(null, ws_group = org_id);
	}
}

on("submit", "#loginform", async function (evt) {
	evt.preventDefault();
	let form = evt.match.elements;
	const credentials = {email: form.email.value, password: form.password.value};
	const resp = await fetch("/login", {method: "POST", body: JSON.stringify(credentials)});
	const token = await resp.json();
	if (token) {
		user = {email: form.email.value, token: token.token};
		localStorage.setItem("user", JSON.stringify(user));
		await get_user_details();
	} else {
		alert("Invalid username or password");
	}
});

on("click", "#logout", function () {
	localStorage.removeItem("user");
	user = null;
	ws_sync.reconnect();
});

on("change", "#blankcontract", async function (e) {
	const file = e.match.files[0];
	if (file && DOM("#newTemplateName").value === "") {
		DOM("#newTemplateName").value = file.name;
	}

});

on("click", ".specified-template", async function (e) {
	history.replaceState(null, null, "#template-" + e.match.dataset.id);
	update_template_details(e.match.dataset.id);
});

on("submit", "#template_submit", async function (e) {
	e.preventDefault();
	let resp = await fetch("/orgs/" + org_id + "/templates", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: "Bearer " + user.token
		},
		body: JSON.stringify({name: DOM("#newTemplateName").value})
	});
	const template_info = await resp.json();
	resp = await fetch(`/upload?template_id=${template_info.id}`, {
		method: "POST",
		headers: {
			Authorization: "Bearer " + user.token
		},
		body: DOM("#blankcontract").files[0]
	});
	fetch_templates(org_id);
});

on("click", ".hello", function () {
	ws_sync.send({cmd: "hello"});
});
