/** 
 * array of nested objects that user has decided 
 * to provide additional interfaces for
 */
let nestedInterfaces = [];

export const getParentAndChildInterfaces = async(title, jsonInput) => {
  try {
    const obj = JSON.parse(jsonInput);
    const parent = await convert(title, obj);
    if (parent) {
      const declarations = parent 
        + "\n\n" 
        + nestedInterfaces
          .toString()
          .replace(/,/g, "\n\n");

      nestedInterfaces = [];
      return declarations;
    } else {
      nestedInterfaces = [];
      return "";
    }
  } catch(err) {
    console.error(err);
    alert("Invalid json, please check input");
    nestedInterfaces = [];
    return ""; 
  }
}

const convert = async(title, obj) => {
  let tsInterface = "";
  return '<span class="color-orange">interface </span>' 
    + `<span class="color-purple">${title}</span>`
    + ' {\n' 
    + await parseEntries(tsInterface, obj, 1) 
    + '}';
}

const parseEntries = async(tsInterface, obj, depth) => {
  /** 
   * recursively find types of object values and generate
   * string for interface declaration. prompt user if val
   * is an object so they can provide interface names
   * for nested objects
   */
  for (const [key, val] of Object.entries(obj)) {
    tsInterface += indent((key + ": "), depth);
    const typeofVal = typeof val;
    if (typeofVal === "object") {
      if (Array.isArray(val)) {
        if (val.length) {
          const typeofArr = typeof val[0];
          if (typeofArr === "object") {
            const name = await nameObject(key, val[0]);
            if (name) {
              tsInterface += `<span class="color-green">${name}</span>[]`;
            } else {
              tsInterface += '{\n' 
              + await parseEntries("", val[0], depth + 1) 
              + indent('}[]', depth);
            }
          } else {
            tsInterface += 
              `<span class="color-blue">${typeof val[0]}</span>[]`;
          }
        } else {
          tsInterface += '[]';
        }
      } else {
        const name = await nameObject(key, val);
        if (name) {
          tsInterface += `<span class="color-green">${name}</span>`;
        } else {
          tsInterface += '{\n' 
          + await parseEntries("", val, depth + 1) 
          + indent('}', depth);
        }
      }
    } else {
      tsInterface += `<span class="color-blue">${typeofVal}</span>`;
    }
    tsInterface += ";\n";
  }

  return tsInterface;
}

const indent = (input, depth) => {
  let spacing = "";
  for (let i = 0; i < depth; i++) {
    spacing += "  ";
  }
  return spacing + input;
}

const nameObject = async(key, val) => {
  const name = await promptName(key, val);
  if (name) nestedInterfaces.push(await convert(name, val));
  return name;
}

/**
 * For some reason electron doesn't support the built in prompt
 * window function so I made this over-complicated async thing
 * to compensate. There's probably a way better way to do this :)
 */
const promptName = async(key, val) => {
  const wrapper = document.getElementById("modal-wrapper");
  const modal = document.getElementById("modal");
  const question = document.getElementById("modal-question");
  const noButton = document.getElementById("modal-no");
  const yesButton = document.getElementById("modal-yes");
  const input = document.getElementById("modal-input");

  question.innerText = 
    "Would you like to provide an interface for this object?\n" 
    + key + ": "
    + JSON.stringify(val);
  
  modal.classList.add("slide-in");
  wrapper.classList.remove("hidden");
  input.focus();

  let decisionMade = false;
  let decision = "";

  const decide = () => decisionMade = true;

  noButton.addEventListener("click", decide);
  yesButton.addEventListener("click", () => {
    decision = input.value;
    decide();
  });

  const until = async(condition) => {
    const poll = (resolve) => {
      if (condition()) {
        resolve();
      } else {
        setTimeout(() => poll(resolve), 100);
      }
    }

    return new Promise(poll);
  }

  await until(() => decisionMade === true);

  wrapper.classList.add("hidden");
  modal.classList.remove("slide-in");
  input.value = "";
  return decision;
}