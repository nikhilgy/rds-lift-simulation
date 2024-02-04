

let liftStatus = []
const createLiftState = function(numOfLifts){

    for(let i = 1;i<=numOfLifts;i++){

        liftStatus.push({
            floor : 1,
            moving : false,
            targetFloor : 1
        })
    }

}

const renderBuildingMap = function(numOfFloors, numOfLifts){

    const elevatorPanel = document.getElementById("elevator-panel")
    console.log("Total Floors: ", numOfFloors);
    elevatorPanel.innerHTML = ""
    elevatorPanel.style.display = 'none'
    document.body.removeChild(elevatorPanel)
    document.body.style.display = 'block'

    // create floors

    const elevatorContainer = document.createElement('div')
    elevatorContainer.className = 'elevator-container'
    document.body.appendChild(elevatorContainer)

    for(let i = numOfFloors; i>=1;i--){

        const floorContainer = document.createElement('div')
        floorContainer.className = 'floor-container'

        const buttonContainer = document.createElement('div')
        buttonContainer.className = 'button-container'

        const upButton = document.createElement('button')
        upButton.className = 'button up-button'
        upButton.style.padding = '5px'
        const upAngleImg = document.createElement('img')
        upAngleImg.src = 'assets/angle-up-solid.svg'
        upButton.appendChild(upAngleImg)
        // upButton.innerHTML = "Up"

        const downButton = document.createElement('button')
        downButton.className = 'button down-button'
        downButton.style.padding = '5px'
        const downAngleImg = document.createElement('img')
        downAngleImg.src = 'assets/angle-down-solid.svg'
        downButton.appendChild(downAngleImg)
        // downButton.innerHTML = "Down"

        buttonContainer.appendChild(upButton)
        buttonContainer.appendChild(downButton)
        
        floorContainer.appendChild(buttonContainer)
        
        const line = document.createElement("div");
        line.className = "floor-line";
        floorContainer.appendChild(line);

        const floorNum = document.createElement('div')
        floorNum.className = 'floor-number'
        floorNum.innerHTML = i

        floorContainer.appendChild(floorNum)


        elevatorContainer.appendChild(floorContainer)

    }

    let leftOffset = 120;
    if (window.innerWidth <= 768) {
      leftOffset = 80;
    }
  
    for (let liftIndex = 0; liftIndex < numOfLifts; liftIndex++) {
      const liftContainer = document.createElement("div");
      liftContainer.className = `lift-container lift-${liftIndex}`;
  
      const lift = document.createElement("div");
      lift.className = "lift";

      liftContainer.style.left = `${leftOffset}px`;
  
      liftContainer.appendChild(lift);
      elevatorContainer.appendChild(liftContainer);
      
      if (window.innerWidth <= 768) {
        leftOffset += 35;
      } else {
        leftOffset += 60;
      }
    }
  };


const startSimulation = function(){

    // get inputs
    const numOfFloors = parseInt(document.getElementById('floors').value)
    const numOfLifts = parseInt(document.getElementById('lifts').value)
    
    // validate inputs
    if (Number.isInteger(numOfFloors) && numOfFloors > 0 &&
        Number.isInteger(numOfLifts) && numOfLifts > 0) {
      // Values are valid, proceed with your logic
      console.log('Floors:', numOfFloors);
      console.log('Lifts:', numOfLifts);
    } else {
      // Values are not valid, display an error or take appropriate action
      alert('Please enter valid integer values greater than 0 for both floors and lifts.');
      return;
    }

    createLiftState(numOfLifts)

    // create building floors and stuff
    renderBuildingMap(numOfFloors, numOfLifts)

}

document.addEventListener("DOMContentLoaded", function () {

    const simulateBtn = document.getElementById('simulate')

    simulateBtn.addEventListener('click', () => {
        startSimulation()
    })

})