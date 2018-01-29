const chartMap = [
  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
  1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1,
  1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
];

const periodicRowCount = 18;
const periodicExtendedRowCount = 14;
let periodicData = '';

function loadJSON(callback) {
  const xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open('GET', 'js/periodic_table_clean.json', true);
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == "200") {
      callback(xobj.responseText);
    }
  };
  xobj.send(null);
}

function initializePeriodicTable() {
  loadJSON(function (response) {
    periodicData = JSON.parse(response);
    setMainTable(chartMap, periodicData);
  });
}

function setMainTable(gridMap, gridData) {
  let periodicGrid = document.querySelector(".grid");
  let j = 0;
  for (let i = 0; i < gridMap.length; i++) {
    let elementTile = document.createElement("element-tile");
    let elementContent = document.createElement("element-content");
    if (chartMap[i] > 0) {
      if (chartMap[i] === 1) {
        let egroup = typeToClass(gridData.data[j].properties.type);
        elementContent.className = egroup;
        let ename = gridData.data[j].properties.element;
        let esymbol = gridData.data[j].properties.symbol;
        let eatomic = gridData.data[j].properties['atomic-number'];
        let elName = document.createElement("element-name");
        let elSymbol = document.createElement("element-symbol");
        let elNumber = document.createElement("atomic-number");
        // elName.textContent = ename;
        // elSymbol.textContent = esymbol;
        // elNumber.textContent = eatomic;
        // elementContent.appendChild(elNumber);
        // elementContent.appendChild(elSymbol);
        // simplify above, maybe?
        elementContent.innerHTML = `
          <atomic-number>${eatomic}</atomic-number>
          <element-symbol>${esymbol}</element-symbol>
          <element-name>${ename}</element-name>
        `;
        //elementContent.appendChild(elName);
        elementTile.appendChild(elementContent);
        periodicGrid.appendChild(elementTile);
        j++;
      } else {
        // go ahead and count up to proper display numbers
        j++;
        let eatomic = (j) + " - " + (j + periodicExtendedRowCount);
        let elNumber = document.createElement("atomic-number");
        elNumber.textContent = eatomic;
        elementContent.appendChild(elNumber);
        elementTile.appendChild(elementContent);
        periodicGrid.appendChild(elementTile);
        j += periodicExtendedRowCount;
      }
    } else {
      // need to add layout class sometimes, based on having neighbors
      let tileClass = (chartMap[i + periodicRowCount] > 0) ? null : "layout";
      if (tileClass !== null) { elementTile.className = tileClass; }
      periodicGrid.appendChild(elementTile);
    }
  }
  setActions();
}

function setActions() {
  let elements = document.querySelectorAll('.grid element-tile > element-content');
  for(let i=0; i<elements.length; i++) {
    elements[i].addEventListener('click', function(e) {
      //console.log(e.currentTarget.firstChild.innerText);
      showElementCard(e.currentTarget.firstChild.innerText, e.currentTarget.clientWidth, e.currentTarget.offsetTop, e.currentTarget.offsetLeft);
      console.log(e.currentTarget);
      //offsetLeft
      //offsetTop
      //clientHeight
      //clientWidth
    });
  }
}

/*
<element-card>
        <antes-top-row>
            <atomic-number>76</atomic-number>
            <element-info>&#9432;</element-info>
        </antes-top-row>
        <top-row>
            <element-symbol>Pt</element-symbol>
            <element-name-and>
                <element-name>Platinum</element-name>
                <element-weight><strong>weight: </strong>195.084</element-weight>
                <element-configuration><strong>config: </strong>[Xe] 4f<sup>14</sup> 5d<sup>9</sup> 6s<sup>1</sup></element-configuration>
            </element-name-and>
        </top-row>
        <element-image>
            <img src="platinum.png" alt="" srcset="">
        </element-image>
    </element-card>
*/

function toggleBlur(targetBlur) {
  if(targetBlur.classList.contains('blurred')) {
    targetBlur.classList.remove('blurred');
  } else {
    targetBlur.classList.add('blurred');
  }
}

function setResetAction() {
  let m = document.querySelector(".modal-background");
  m.addEventListener('click', function(e) {
    removeElement(e.currentTarget);
    toggleBlur(document.querySelector(".grid"));
  });
}

function removeElement(which) {
  which.parentNode.removeChild(which);
}

function showElementCard(atomicNumber, elWidthHeight, elTop, elLeft) {
  // atomic-number
  let currentElement = periodicData.data.find(function (obj) { return obj.id === atomicNumber; });
  //alert("show me " + currentElement.properties.element);
  toggleBlur(document.querySelector(".grid"));
  let m = document.createElement("div");
  m.className = "modal-background";
  let c = document.createElement("element-card");
  // NEED TO TEST ON MOBILE OR
  // WHEN SCROLL IS NOT 0,0
  c.style.position = 'fixed';
  c.style.width = elWidthHeight+'px';
  c.style.height = elWidthHeight+'px';
  c.style.left = elLeft+'px';
  c.style.top = elTop+'px';
  c.innerText = currentElement.properties.element;
  document.body.appendChild(m);
  showCard(m, c);
  setResetAction();
}

function showCard(currModal, currCard) {
  currModal.appendChild(currCard);
}

function showElementNeighbors(atomicNumber) {
  // generates the navigation above main card
  // of elements to the "left" and "right" of
  // the current element
  // not going to do inifinite loop for this.

  // LOGIC
  // is element greater than one and less than 118
  // generate normal
  // "left" = atomicNumber - 1; "right" = atomicNumber + 1
}

function typeToClass(elType) {
  return elType.toLowerCase().split(" ").join("-");
}

function setExtendedTable(extendedData) {
  // populate extended table with last 28 elements
}

// wait for it
document.addEventListener("DOMContentLoaded", function (event) {
  initializePeriodicTable();
});


