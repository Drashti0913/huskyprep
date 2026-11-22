import PropTypes from "prop-types";
import { useState } from "react";
import { saveExperience } from "../../api/experiencesApi.js";
import { capitalize } from "../../utils/format.js";
import { experienceShape, metaShape } from "../../utils/propShapes.js";
import "./ExperienceForm.css";

function initialValues(experience) {
  if (!experience) {
    return {
      company: "",
      role: "",
      roleType: "",
      coopCycle: "",
      format: "",
      rounds: "1",
      difficulty: "",
      outcome: "",
      questions: "",
      tips: "",
    };
  }
  return {
    ...experience,
    rounds: String(experience.rounds),
    questions: experience.questions.join("\n"),
    tips: experience.tips || "",
  };
}

export default function ExperienceForm({ meta, editing, onSaved, onCancel }) {
  const [values, setValues] = useState(() => initialValues(editing));
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  function handleChange(event) {
    setValues({ ...values, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setErrors({});
    setMessage("");
    const payload = {
      company: values.company,
      role: values.role,
      roleType: values.roleType,
      coopCycle: values.coopCycle,
      format: values.format,
      rounds: Number(values.rounds),
      difficulty: values.difficulty,
      outcome: values.outcome,
      questions: values.questions.split("\n"),
      tips: values.tips,
    };
    try {
      const saved = await saveExperience(editing?._id, payload);
      onSaved(saved, Boolean(editing));
      if (!editing) setValues(initialValues(null));
    } catch (err) {
      setErrors(err.fieldErrors || {});
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  }

  const invalid = (field) => (errors[field] ? "true" : undefined);
  const error = (field) =>
    errors[field] && <p className="field-error">{errors[field]}</p>;

  function select(field, label, options) {
    return (
      <div className="field">
        <label htmlFor={`experience-${field}`}>{label}</label>
        <select
          id={`experience-${field}`}
          name={field}
          value={values[field]}
          onChange={handleChange}
          aria-invalid={invalid(field)}
          required
        >
          <option value="">Choose…</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {capitalize(option)}
            </option>
          ))}
        </select>
        {error(field)}
      </div>
    );
  }

  return (
    <section
      className="panel experience-form"
      aria-labelledby="experience-form-title"
    >
      <h2 id="experience-form-title">
        {editing ? "Edit your experience" : "Share your interview"}
      </h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="experience-company">Company</label>
          <input
            id="experience-company"
            name="company"
            type="text"
            value={values.company}
            onChange={handleChange}
            aria-invalid={invalid("company")}
            required
          />
          {error("company")}
        </div>
        <div className="field">
          <label htmlFor="experience-role">Role title</label>
          <input
            id="experience-role"
            name="role"
            type="text"
            value={values.role}
            onChange={handleChange}
            aria-invalid={invalid("role")}
            placeholder="Software Engineer Co-op"
            required
          />
          {error("role")}
        </div>
        <div className="field-row">
          {select("roleType", "Role type", meta.roleTypes)}
          {select("coopCycle", "Co-op cycle", meta.coopCycles)}
        </div>
        <div className="field-row">
          {select("format", "Format", meta.formats)}
          <div className="field">
            <label htmlFor="experience-rounds">Rounds</label>
            <input
              id="experience-rounds"
              name="rounds"
              type="number"
              min="1"
              max="10"
              value={values.rounds}
              onChange={handleChange}
              aria-invalid={invalid("rounds")}
              required
            />
            {error("rounds")}
          </div>
        </div>
        <fieldset className="field">
          <legend>Difficulty</legend>
          <div className="radio-row">
            {meta.difficulties.map((level) => (
              <label key={level}>
                <input
                  type="radio"
                  name="difficulty"
                  value={level}
                  checked={values.difficulty === level}
                  onChange={handleChange}
                />
                {capitalize(level)}
              </label>
            ))}
          </div>
          {error("difficulty")}
        </fieldset>
        {select("outcome", "Outcome", meta.outcomes)}
        <div className="field">
          <label htmlFor="experience-questions">Questions you were asked</label>
          <textarea
            id="experience-questions"
            name="questions"
            rows="4"
            value={values.questions}
            onChange={handleChange}
            aria-invalid={invalid("questions")}
            aria-describedby="experience-questions-hint"
            required
          />
          <p id="experience-questions-hint" className="field-hint">
            One question per line.
          </p>
          {error("questions")}
        </div>
        <div className="field">
          <label htmlFor="experience-tips">
            Tips for others <span className="field-hint">(optional)</span>
          </label>
          <textarea
            id="experience-tips"
            name="tips"
            rows="3"
            value={values.tips}
            onChange={handleChange}
            aria-invalid={invalid("tips")}
          />
          {error("tips")}
        </div>
        {message && (
          <p className="field-error" role="alert">
            {message}
          </p>
        )}
        <div className="form-actions">
          <button type="submit" className="button" disabled={busy}>
            {editing ? "Save changes" : "Share experience"}
          </button>
          {editing && (
            <button
              type="button"
              className="button button-secondary"
              onClick={onCancel}
            >
              Cancel edit
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

ExperienceForm.propTypes = {
  meta: metaShape.isRequired,
  editing: experienceShape,
  onSaved: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
