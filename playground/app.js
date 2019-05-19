import React, { Component } from "react";
import { render } from "react-dom";
import { UnControlled as CodeMirror } from "react-codemirror2";
import "codemirror/mode/javascript/javascript";

import { shouldRender } from "../src/utils";
import Form from "../src";
import logo from "../logo.png";
// Import a few CodeMirror themes; these are used to match alternative
// bootstrap ones.
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/theme/blackboard.css";
import "codemirror/theme/mbo.css";
import "codemirror/theme/ttcn.css";
import "codemirror/theme/solarized.css";
import "codemirror/theme/monokai.css";
import "codemirror/theme/eclipse.css";
import { processSchemas, getInitialFormData } from "./utils";

const log = type => console.log.bind(console, type);
const fromJson = json => JSON.parse(json);
const toJson = val => JSON.stringify(val, null, 2);
const liveSettingsSchema = {
  type: "object",
  properties: {
    validate: { type: "boolean", title: "Live validation" }
  }
};
const cmOptions = {
  theme: "default",
  height: "auto",
  viewportMargin: Infinity,
  mode: {
    name: "javascript",
    json: true,
    statementIndent: 2,
  },
  lineNumbers: true,
  lineWrapping: true,
  indentWithTabs: false,
  tabSize: 2,
};
const themes = {
  default: {
    stylesheet:
      "//maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css",
  },
  cerulean: {
    stylesheet:
      "//cdnjs.cloudflare.com/ajax/libs/bootswatch/3.3.6/cerulean/bootstrap.min.css",
  },
  cosmo: {
    stylesheet:
      "//cdnjs.cloudflare.com/ajax/libs/bootswatch/3.3.6/cosmo/bootstrap.min.css",
  },
  cyborg: {
    stylesheet:
      "//cdnjs.cloudflare.com/ajax/libs/bootswatch/3.3.6/cyborg/bootstrap.min.css",
    editor: "blackboard",
  },
  darkly: {
    stylesheet:
      "//cdnjs.cloudflare.com/ajax/libs/bootswatch/3.3.6/darkly/bootstrap.min.css",
    editor: "mbo",
  },
  flatly: {
    stylesheet:
      "//cdnjs.cloudflare.com/ajax/libs/bootswatch/3.3.6/flatly/bootstrap.min.css",
    editor: "ttcn",
  },
  journal: {
    stylesheet:
      "//cdnjs.cloudflare.com/ajax/libs/bootswatch/3.3.6/journal/bootstrap.min.css",
  },
  lumen: {
    stylesheet:
      "//cdnjs.cloudflare.com/ajax/libs/bootswatch/3.3.6/lumen/bootstrap.min.css",
  },
  paper: {
    stylesheet:
      "//cdnjs.cloudflare.com/ajax/libs/bootswatch/3.3.6/paper/bootstrap.min.css",
  },
  readable: {
    stylesheet:
      "//cdnjs.cloudflare.com/ajax/libs/bootswatch/3.3.6/readable/bootstrap.min.css",
  },
  sandstone: {
    stylesheet:
      "//cdnjs.cloudflare.com/ajax/libs/bootswatch/3.3.6/sandstone/bootstrap.min.css",
    editor: "solarized",
  },
  simplex: {
    stylesheet:
      "//cdnjs.cloudflare.com/ajax/libs/bootswatch/3.3.6/simplex/bootstrap.min.css",
    editor: "ttcn",
  },
  slate: {
    stylesheet:
      "//cdnjs.cloudflare.com/ajax/libs/bootswatch/3.3.6/slate/bootstrap.min.css",
    editor: "monokai",
  },
  spacelab: {
    stylesheet:
      "//cdnjs.cloudflare.com/ajax/libs/bootswatch/3.3.6/spacelab/bootstrap.min.css",
  },
  "solarized-dark": {
    stylesheet:
      "//cdn.rawgit.com/aalpern/bootstrap-solarized/master/bootstrap-solarized-dark.css",
    editor: "dracula",
  },
  "solarized-light": {
    stylesheet:
      "//cdn.rawgit.com/aalpern/bootstrap-solarized/master/bootstrap-solarized-light.css",
    editor: "solarized",
  },
  superhero: {
    stylesheet:
      "//cdnjs.cloudflare.com/ajax/libs/bootswatch/3.3.6/superhero/bootstrap.min.css",
    editor: "dracula",
  },
  united: {
    stylesheet:
      "//cdnjs.cloudflare.com/ajax/libs/bootswatch/3.3.6/united/bootstrap.min.css",
  },
  yeti: {
    stylesheet:
      "//cdnjs.cloudflare.com/ajax/libs/bootswatch/3.3.6/yeti/bootstrap.min.css",
    editor: "eclipse",
  },
};

class GeoPosition extends Component {
  constructor(props) {
    super(props);
    this.state = { ...props.formData };
  }

  onChange(name) {
    return event => {
      this.setState({ [name]: parseFloat(event.target.value) });
      setImmediate(() => this.props.onChange(this.state));
    };
  }

  render() {
    const { lat, lon } = this.state;
    return (
      <div className="geo">
        <h3>Hey, I'm a custom component</h3>
        <p>
          I'm registered as <code>geo</code> and referenced in
          <code>uiSchema</code> as the <code>ui:field</code> to use for this
          schema.
        </p>
        <div className="row">
          <div className="col-sm-6">
            <label>Latitude</label>
            <input
              className="form-control"
              type="number"
              value={lat}
              step="0.00001"
              onChange={this.onChange("lat")}
            />
          </div>
          <div className="col-sm-6">
            <label>Longitude</label>
            <input
              className="form-control"
              type="number"
              value={lon}
              step="0.00001"
              onChange={this.onChange("lon")}
            />
          </div>
        </div>
      </div>
    );
  }
}

class Editor extends Component {
  constructor(props) {
    super(props);
    this.state = { valid: true, code: props.code };
  }

  componentWillReceiveProps(props) {
    this.setState({ valid: true, code: props.code });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shouldRender(this, nextProps, nextState);
  }

  onCodeChange = (editor, metadata, code) => {
    this.setState({ valid: true, code });
    setImmediate(() => {
      try {
        this.props.onChange(fromJson(this.state.code));
      } catch (err) {
        this.setState({ valid: false, code });
      }
    });
  };

  render() {
    const { title, theme } = this.props;
    const icon = this.state.valid ? "ok" : "remove";
    const cls = this.state.valid ? "valid" : "invalid";
    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          <span className={`${cls} glyphicon glyphicon-${icon}`} />
          {" " + title}
        </div>
        <CodeMirror
          value={this.state.code}
          onChange={this.onCodeChange}
          autoCursor={false}
          options={Object.assign({}, cmOptions, { theme })}
        />
      </div>
    );
  }
}

class Selector extends Component {
  constructor(props) {
    super(props);
    this.state = { current: props.schemaName };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shouldRender(this, nextProps, nextState);
  }

  onLabelClick = label => {
    const { samples } = this.props;
    return event => {
      event.preventDefault();
      this.setState({ current: label });
      setImmediate(() => this.props.onSelected(samples[label]));
    };
  };

  onSelectHandle = event => {
    const { samples } = this.props;
    event.preventDefault();
    const selectedIndex = event.target.selectedIndex;
    const label = event.target[selectedIndex].text;
    this.setState({ current: label });
    setImmediate(() => this.props.onSelected(samples[label]));
  };

  render() {
    const { schemaName, samples } = this.props;
    const selectedValue = Object.keys(samples).indexOf(schemaName);
    return (
      <select
        className="form-control"
        onChange={this.onSelectHandle}
        value={selectedValue}
        style={{ maxWidth: 720, marginBottom: 10, }}>
        {Object.keys(samples).map((label, i) => {
          return (
            <option
              key={i}
              value={i}
              role="presentation"
              className={this.state.current === label ? "active" : ""}>
              {label}
            </option>
          );
        })}
      </select>
    );
  }
}

function ThemeSelector({ theme, select }) {
  const themeSchema = {
    type: "string",
    enum: Object.keys(themes),
  };
  return (
    <Form
      schema={themeSchema}
      formData={theme}
      onChange={({ formData }) => select(formData, themes[formData])}>
      <div />
    </Form>
  );
}

const UploadButton = ({ handleFile }) =>
  (<label
    className="btn btn-primary"
    style={{
      position: "relative",
      overflow: "hidden"
    }}>
    Upload{" "}
    <input
      type="file"
      accept={"application/json,.json"}
      onChange={e => handleFile(e.target.files[0])}
      hidden
      style={{
        opacity: 0,
        position: "absolute",
        right: 0,
        top: 0
      }}
    />
  </label>);

class CopyLink extends Component {
  onCopyClick = event => {
    this.input.select();
    document.execCommand("copy");
  };

  render() {
    const { shareURL, onShare } = this.props;
    if (!shareURL) {
      return (
        <button className="btn btn-default" type="button" onClick={onShare}>
          Share
        </button>
      );
    }
    return (
      <div className="input-group">
        <input
          type="text"
          ref={input => (this.input = input)}
          className="form-control"
          defaultValue={shareURL}
        />
        <span className="input-group-btn">
          <button
            className="btn btn-default"
            type="button"
            onClick={this.onCopyClick}>
            <i className="glyphicon glyphicon-copy" />
          </button>
        </span>
      </div>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    // initialize state with Simple data sample
    let { samples, defaultSchema } = this.props;

    defaultSchema = !!defaultSchema ? defaultSchema : Object.keys(samples)[0];
    console.log(samples, defaultSchema);
    const { schema, uiSchema, formData, validate } = samples[defaultSchema];
    this.state = {
      form: false,
      schema,
      uiSchema,
      formData,
      validate,
      editor: "default",
      theme: "default",
      liveSettings: {
        validate: true,
        disable: false
      },
      shareURL: null,
      schemaFound: true,
    };
  }

  componentDidMount() {
    let { samples, defaultSchema } = this.props;
    defaultSchema = !!defaultSchema ? defaultSchema : Object.keys(samples)[0];
    this.load(samples[defaultSchema]);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shouldRender(this, nextProps, nextState);
  }

  load = data => {
    // Reset the ArrayFieldTemplate whenever you load new data
    const { ArrayFieldTemplate = null, ObjectFieldTemplate = null } = data;
    // uiSchema is missing on some examples. Provide a default to
    // clear the field in all cases.
    let { formData, schemaFound } = this.state;
    let { uiSchema = {}, schema } = data;
    if (schemaFound) {
      formData = getInitialFormData(schema);
    }
    // force resetting form component instance
    this.setState({
      form: false,
      formData }, _ =>

      this.setState({
        ...data,
        form: true,
        formData,
        ArrayFieldTemplate,
        ObjectFieldTemplate,
        uiSchema
      })
    );
  };

  onSchemaEdited = schema => this.setState({ schema, shareURL: null });

  onUISchemaEdited = uiSchema => this.setState({ uiSchema, shareURL: null });

  onFormDataEdited = formData => this.setState({ formData, shareURL: null });

  onThemeSelected = (theme, { stylesheet, editor }) => {
    this.setState({ theme, editor: editor ? editor : "default" });
    setImmediate(() => {
      // Side effect!
      document.getElementById("theme").setAttribute("href", stylesheet);
    });
  };

  setLiveSettings = ({ formData }) => this.setState({ liveSettings: formData });

  onFormDataChange = ({ formData }) => {
    if (this.state.schemaFound) {
      this.setState({ formData, shareURL: null });
    }
  };

  onShare = () => {
    const { formData, schema, uiSchema } = this.state;
    const {
      location: { origin, pathname },
    } = document;
    try {
      const hash = btoa(JSON.stringify({ formData, schema, uiSchema }));
      this.setState({ shareURL: `${origin}${pathname}#${hash}` });
    } catch (err) {
      this.setState({ shareURL: null });
    }
  };

  downloadFile = async () => {
    const { formData, schema } = this.state;
    const fileName = "form-data";
    const json = toJson({ schema_name: schema.schema_name, data: formData });
    const blob = new Blob([json], { type: "application/json" });
    const href = await URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = fileName + ".json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  clearFormData = () => {
    const { schema } = this.state;
    const formData = getInitialFormData(schema);
    this.setState({ formData });
  };

  // processes uploaded json
  handleFileProcessing = event => {
    const { samples } = this.props;
    const content = event.target.result;
    try {
      const jsonResult = JSON.parse(content);
      let { schema_name, data } = jsonResult;
      if (!schema_name || !samples.hasOwnProperty(schema_name)) {
        alert("Schema Not Found - Please select an appropriate schema");
        data = !!data ? data : jsonResult;
        const liveSettings = {
          validate: false,
          previous: this.state.liveSettings.validate
        };
        this.setState({ formData: data, schemaFound: false, liveSettings });
      } else if (schema_name) {

        const formData = !!data
          ? data
          : getInitialFormData(samples[schema_name]);
        data = { ...samples[schema_name], ...{ formData } };
        this.load(data);
      }
    } catch (e) {
      // parsing error probably means not a valid json
      alert("The file is not a valid JSON File");
    }
  };

  handleFile = file => {
    // check for correct extension
    if (file.type !== "application/json") {
      alert("The file needs to have a .json extension");
      return;
    }
    // differ file processing to handleFileProcessing
    const fileReader = new FileReader();
    fileReader.onload = this.handleFileProcessing;
    fileReader.readAsText(file);
  };

  handleSchemaFound = e => {
    const { liveSettings } = this.state;
    this.setState({
      schemaFound: true,
      liveSettings: { ...liveSettings, ...{ validate: liveSettings.previous } }
    });
  };

  handleSchemaCancel = e => {
    const { schema, liveSettings } = this.state;
    const formData = getInitialFormData(schema);
    this.setState({
      schemaFound: true,
      liveSettings: { ...liveSettings, ...{ validate: liveSettings.previous } },
      formData
    });
  }

  render() {
    const { samples } = this.props;
    const {
      schema,
      uiSchema,
      formData,
      liveSettings,
      validate,
      theme,
      editor,
      ArrayFieldTemplate,
      ObjectFieldTemplate,
      transformErrors,
      schemaFound,
    } = this.state;

    return (
      <div className="container-fluid">
        <div className="page-header" style={{ marginTop: 5 }}>
          <div
            className="row"
            style={{ display: "flex", alignItems: "center" }}>
            <div className="col-sm-2">
              <img src={logo} alt={"LOGO"} style={{ height: 50, width: 50 }} />
            </div>
            <div className="col-sm-8">
              <h1>JSON Data Driver</h1>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-8">
              <Selector
                onSelected={this.load}
                schemaName={schema.schema_name}
                samples={samples} />
            </div>
            <div className="col-sm-2">
              {schemaFound ? (
                <Form
                  schema={liveSettingsSchema}
                  formData={liveSettings}
                  onChange={this.setLiveSettings}>
                  <div />
                </Form> )
                : ([
                  <button
                    className={"btn btn-primary"}
                    style={ {marginBottom: 10, marginRight: 10} }
                    onClick={this.handleSchemaFound}>
                    Schema Found
                  </button>,
                  <button
                    className={"btn btn-warning"}
                    style={ {marginBottom: 10} }
                    onClick={this.handleSchemaCancel}>
                    Cancel
                  </button>
              ])}
            </div>
            <div className="col-sm-2">
              <ThemeSelector theme={theme} select={this.onThemeSelected} />
            </div>
          </div>
        </div>
        <div className="col-sm-7">
          {this.state.form && (
            <Form
              ArrayFieldTemplate={ArrayFieldTemplate}
              ObjectFieldTemplate={ObjectFieldTemplate}
              liveValidate={liveSettings.validate}
              disabled={liveSettings.disable}
              schema={schema}
              uiSchema={uiSchema}
              formData={formData}
              onChange={this.onFormDataChange}
              onSubmit={({ formData }, e) => {
                console.log("submitted formData", formData);
                console.log("submit event", e);
              }}
              fields={{ geo: GeoPosition }}
              validate={validate}
              onBlur={(id, value) =>
                console.log(`Touched ${id} with value ${value}`)
              }
              onFocus={(id, value) =>
                console.log(`Focused ${id} with value ${value}`)
              }
              transformErrors={transformErrors}
              onError={log("errors")}>
              <div
                className="row"
                style={{
                  borderTop: "1px solid rgb(229, 229, 229)",
                  paddingTop: 10
                }}>
                <div className="col-xs-4 col-sm-4">
                  <UploadButton handleFile={this.handleFile} />
                </div>
                <div className="col-xs-4 col-sm-4 text-center">
                  <button
                    className={"btn btn-primary"}
                    onClick={this.downloadFile}>
                    Download
                  </button>
                </div>
                <div className="col-xs-4 col-sm-4 text-right">
                  <button
                    className={"btn btn-warning"}
                    onClick={this.clearFormData}>
                    Clear
                  </button>
                </div>
              </div>
              <div
                className={"row"}
                style={{ paddingTop: 10, paddingBottom: 10 }}
              />
            </Form>
          )}
        </div>
        <div className="col-sm-5">
          <Editor
            title="formData"
            theme={editor}
            code={ toJson(formData) }
            onChange={this.onFormDataEdited} />
        </div>
      </div>
    );
  }
}

if (process.env.NODE_ENV === "production") {
  render(
    <App samples={window.schemas} defaultSchema={window.defaultSchema} />,
    document.getElementById("app")
  );
} else {
  const samples = processSchemas();
  render(<App samples={samples} />, document.getElementById("app"));
}
