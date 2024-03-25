CREATE TABLE templates (
	id SERIAL PRIMARY KEY,
	name varchar NOT NULL,
	created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
	primary_org_id bigint NOT NULL,
	page_count smallint
);

CREATE TABLE template_pages (
	template_id int NOT NULL REFERENCES templates,
	page_number smallint NOT NULL,
	page_data BYTEA NOT NULL
);

CREATE TABLE template_signatories (
	id BIGSERIAL PRIMARY KEY,
	name varchar NOT NULL,
	template_id int NOT NULL REFERENCES templates
);

CREATE TABLE audit_rects (
  id BIGSERIAL PRIMARY KEY,
  audit_type varchar NOT NULL, -- initials, signature, date
  x1 smallint NOT NULL,
  y1 smallint NOT NULL,
  x2 smallint NOT NULL,
  y2 smallint NOT NULL,
	template_id int NOT NULL REFERENCES templates,
  name varchar DEFAULT NULL,
  template_signatory_id int NOT NULL REFERENCES template_signatories
);
