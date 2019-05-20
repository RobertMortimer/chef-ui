import React, { Component } from "react";
import { render } from "react-dom";
import { UnControlled as CodeMirror } from "react-codemirror2";
import "codemirror/mode/javascript/javascript";

import { shouldRender } from "../src/utils";
import Form from "../src";
import logo from "./logo.png";
// import "react-bootstrap-modal/lib/css/rbm-patch.css";
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
import { getInitialFormData, processSchemas } from "./utils";
import ModalButton from "./Modal";
import themes from "./themes";
import config from './config';

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
  theme: config.theme,
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
      liveSettings: {
        validate: false,
        disable: false
      },
      shareURL: null,
      schemaFound: true,
      download: false
    };
  }

  componentDidMount() {
    let { samples, defaultSchema } = this.props;
    defaultSchema = !!defaultSchema ? defaultSchema : Object.keys(samples)[0];
    document.getElementById("theme").setAttribute("href", themes[config.theme].stylesheet);
    this.load(samples[defaultSchema]);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shouldRender(this, nextProps, nextState);
  }

  load = (data, userData) => {
    // Reset the ArrayFieldTemplate whenever you load new data
    const { ArrayFieldTemplate = null, ObjectFieldTemplate = null } = data;
    // uiSchema is missing on some examples. Provide a default to

    let { formData, schemaFound } = this.state;
    let { uiSchema = {} } = data;
    if (userData) {
      formData = userData;
    } else if (schemaFound) {
      formData = {};
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

  // creates a modal button if there are errors. otherwise downloads formData
  renderDownloadModal = () => {
    const { download, formData } = this.state;

    if (!download) return;
    const { errors } = this.form.validate(formData);

    // create a modal button
    if (errors.length) {
      return (
        <ModalButton
          title={"You have errors in your form"}
          description={"Please validate your form data before downloading"}
          cancelText={"Okay"}
          onCancel={this.toggleDownloadState}
        >
          <button
            className="btn btn-primary"
            onClick={this.toggleDownloadState}
          >
            Okay
          </button>
          <button className="btn btn-warning" onClick={this.downloadFile}>
            Download Anyway
          </button>
        </ModalButton>
      );
    } else {
      this.downloadFile();
    }
  };

  downloadFile = async e => {
    const { formData, schema } = this.state;
    this.setState({ download: false }, async _ => {
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
    });
  };

  // change the download state
  toggleDownloadState = e => {
    const { download, liveSettings } = this.state;
    let state = { download: !download };

    // download canceled - show live validation
    if (download && !liveSettings.validate) {
      state.liveSettings = { ...liveSettings, validate: true };
    }
    this.setState(state);
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
      let { schema_name, data, ...rest } = jsonResult;
      if (!schema_name || !samples.hasOwnProperty(schema_name)) {
        alert("Schema Not Found - Please select an appropriate schema");
        data = !!data ? data : rest;
        const liveSettings = {
          validate: false,
          previous: this.state.liveSettings.validate
        };
        this.setState({ formData: data, schemaFound: false, liveSettings });
      } else if (schema_name) {
        let formData;
        if (data) formData = data;
        else if (rest) formData = data;
        else formData = {};
        this.load(samples[schema_name], formData);
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
  };

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
      schemaFound
    } = this.state;

    console.log("render", this.state);

    return (
      <div className="container-fluid">
        {this.renderDownloadModal()}
        <div className="page-header" style={{ marginTop: 5 }}>
          <div
            className="row"
            style={{ display: "flex", alignItems: "center" }}
          >
            <div className="col-sm-2">
              <img src={logo} alt={"LOGO"} style={{ height: 50, width: 50 }} />
            </div>
            <div className="col-sm-8">
              <h1>JSON Data Driver</h1>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-2 col-md-1"/>
            <div className="col-sm-8 col-md-8 col-lg-6">
              <Selector
                onSelected={this.load}
                schemaName={schema.schema_name}
                samples={samples}
              />
            </div>
            <div className="col-sm-2 col-md-2">
              {schemaFound ? (
                <Form
                  schema={liveSettingsSchema}
                  formData={liveSettings}
                  onChange={this.setLiveSettings}
                >
                  <div />
                </Form>
              ) : (
                [
                  <button
                    className={"btn btn-primary"}
                    style={{ marginBottom: 10, marginRight: 10 }}
                    onClick={this.handleSchemaFound}
                  >
                    Schema Found
                  </button>,
                  <button
                    className={"btn btn-warning"}
                    style={{ marginBottom: 10 }}
                    onClick={this.handleSchemaCancel}
                  >
                    Cancel
                  </button>
                ]
              )}
            </div>
          </div>
        </div>
        <div className="col-md-1 col-lg-2 col-xl-3"/>
        <div className="col-md-10 col-lg-8 col-xl-6">
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
              ref={node => (this.form = node)}
              onError={errors => console.log("Errors:", errors)}
            >
              <div
                className="row"
                style={{
                  borderTop: "1px solid rgb(229, 229, 229)",
                  paddingTop: 10
                }}
              >
                <div className="col-xs-4 col-sm-4">
                  <UploadButton handleFile={this.handleFile} />
                </div>
                <div className="col-xs-4 col-sm-4 text-center">
                  <button
                    className={"btn btn-primary"}
                    onClick={this.toggleDownloadState}
                  >
                    Download
                  </button>
                </div>
                <div className="col-xs-4 col-sm-4 text-right">
                  <button
                    className={"btn btn-warning"}
                    onClick={this.clearFormData}
                  >
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
      </div>
    );
  }
}

// in production node.js will supply the schema data
if (process.env.NODE_ENV === "production") {
  render(
    <App samples={window.schemas} defaultSchema={window.defaultSchema} />,
    document.getElementById("app")
  );
}
// in development webpack will dynamically import all the schema
else {
  const samples = processSchemas();
  render(<App samples={samples} />, document.getElementById("app"));
}
