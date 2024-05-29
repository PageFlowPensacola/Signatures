inherit annotated;

Process.create_process python;
Stdio.File pythonstdin;
Stdio.File pythonstdout;
string pythondata = "";

void pythonoutput(mixed _, string data){
	pythondata += data;
	while (sscanf(pythondata, "%s\n%s", string line, pythondata)){
		werror("line %O", line);
	}
}

@export:
Concurrent.Future send_msg(mapping json){
	json->msgid = G->G->next_model_msgid++;
	if (!python){
		pythonstdin = Stdio.File();
		pythonstdout = Stdio.File();
		pythonstdout->set_read_callback(pythonoutput);
		// TODO use a Buffer
		python = Process.create_process(
			({"python", "app.py"}),
			([
				"stdin": pythonstdin->pipe(Stdio.PROP_IPC|Stdio.PROP_REVERSE),
				"stdout": pythonstdout->pipe(Stdio.PROP_IPC)
			]));
			werror("process created");
	}
	werror("Json %O", json);
	pythonstdin->write(Standards.JSON.encode(json, 1) + "\n");
}