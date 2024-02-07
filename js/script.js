

let liftStatus = []

// Define a global variable to store pending requests
const pendingRequests = [];

const createLiftState = function(numOfLifts){

    for(let i = 1;i<=numOfLifts;i++){

        liftStatus.push({
            liftNo: i,
            currentFloor : 1,
            openDoors : false,
            direction : null,
            targetFloor : null
        })
    }

}

const delay = function(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const checkIfLiftAlreadyPresent = function(floorCall){
  // console.log("LiftStatus: ", liftStatus);
  return liftStatus.filter(lift=>lift.currentFloor == floorCall || lift.targetFloor == floorCall); //&& lift.direction == null && (lift.targetFloor == null || lift.targetFloor == floorCall)
}

// Add a function to add a request to the pending request queue
const addPendingRequest = function(direction, floorNumber) {
  pendingRequests.push({ direction, floorNumber });
}

const openDoors = function(liftElement, lift){
  // animation for opening door
  console.log("opening doors");
  const childLift = liftElement.children
  // console.log("ChildLift: ", childLift);
  setTimeout(() => {
    childLift[0].style.transform = 'translateX(-100%)';

    setTimeout(() => {
      childLift[0].style.transform = 'translateX(0)';

    }, 2500); 

    setTimeout(()=>{
      // Update elevator's state
      lift.currentFloor = lift.targetFloor
      lift.direction = null;
      lift.targetFloor = null;
      lift.openDoors = false
    }, 2500)

  }, (2 * Math.abs(lift.targetFloor - lift.currentFloor))*1000)
 
  
}

// TODO verify dry run and other scenarios of this logic
const moveLift = async function(lift){
  console.log("Before Lift Status: ", liftStatus);
  const liftElement = document.getElementsByClassName(`lift-${lift.liftNo}`)[0]
  const currentBottom = parseFloat(getComputedStyle(liftElement).bottom)
  const currentBottomRem = currentBottom / parseFloat(getComputedStyle(document.documentElement).fontSize);
  // console.log("Current Bottom: ", currentBottom);
  // console.log("Current Bottom Rem: ", currentBottomRem);
  // console.log(liftElement);
  // console.log("Current Floor: ", lift.currentFloor);
  // console.log("Target Floor: ", lift.targetFloor);
  if (lift.currentFloor < lift.targetFloor) {
    console.log("MoveUp");
    liftElement.style.transition = `bottom ${2 * Math.abs(lift.targetFloor - lift.currentFloor)}s ease-in-out`
    liftElement.style.bottom = `${currentBottomRem + (8*(lift.targetFloor - lift.currentFloor))}rem`//`${8 * lift.targetFloor - lift.currentFloor}rem`  
  } else {
    console.log("MoveDown");
    liftElement.style.transition = `bottom ${2 * Math.abs(lift.targetFloor - lift.currentFloor)}s ease-in-out`
    liftElement.style.bottom = `${currentBottomRem + (8*(lift.targetFloor - lift.currentFloor))}rem`
    
  }

  openDoors(liftElement, lift)

  // add delay of 2500 for 1st timer and 2500 for 2nd timer
  await delay((2 * Math.abs(lift.targetFloor - lift.currentFloor))*1000 + 2500 + 2500)
  
  // Check pending requests after each move
  checkPendingRequests();
}

const selectLift = function(targetdirection, floorCall){
  const liftPresent = checkIfLiftAlreadyPresent(floorCall)
  // console.log("LiftPresent: ", liftPresent);
  if(liftPresent.length > 0){
    const liftElement = document.getElementsByClassName(`lift-${liftPresent[0].liftNo}`)[0]
    // console.log("LiftElement: ", liftElement);
    if(!liftPresent[0].openDoors){
      openDoors(liftElement, liftPresent)
    }
    return
  }
  // Choose the first idle lift
  const idleLift = liftStatus.find((lift) => lift.direction === null && lift.currentFloor === floorCall);

  if (idleLift) {
    return idleLift;
  }

  // If all elevators are busy or in the opposite direction, choose the one with the least distance to the calling floor
  const eligibleLifts = liftStatus.filter(
    (lift) =>
      lift.direction === null ||
      (lift.currentFloor === floorCall)
  );

  // If all lifts are busy, choose the one with the least distance to the calling floor
  const closestLift = eligibleLifts.reduce((closest, lift) => {
    const distanceToFloor = Math.abs(lift.currentFloor - floorCall);
    const closestDistance = Math.abs(closest.currentFloor - floorCall);
    return distanceToFloor < closestDistance ? lift : closest;
  }, eligibleLifts[0]);

  return closestLift;
}

const checkPendingRequests = function() {
  // Check if any lift becomes idle and there are pending requests
  // Assign the lift to the next pending request if available
  console.log("Checking pending requests queue");
  console.log("Pending Requests Queue: ", pendingRequests);
  for (const lift of liftStatus) {
    if (lift.direction === null && pendingRequests.length > 0) {
      const nextRequest = pendingRequests.shift();
      const assignedLift = selectLift(nextRequest.direction, nextRequest.floorNumber);
      if (assignedLift) {
        assignedLift.targetFloor = nextRequest.floorNumber;
        assignedLift.direction = nextRequest.direction;
        moveLift(assignedLift);
      }
    }
  }
}

const liftController = function(button){

  const floorCall = button.dataset.floor
  const targetDirection = button.dataset.direction
  console.log("Floor Call: ", floorCall);
  console.log("Target Direction: ", targetDirection);

  const closestLift = selectLift(targetDirection, floorCall)
  if(closestLift){

    // console.log("Closest Lift: ", closestLift);
    // Update elevator's destination floor and direction
    closestLift.targetFloor = parseInt(floorCall);
    closestLift.direction = targetDirection;
    closestLift.openDoors = true
  
    moveLift(closestLift)


  }else{
      // If no lift is available, add the request to the pending request queue
      addPendingRequest(targetDirection, floorCall);
      console.log(`Added floor call: ${floorCall} to pending requests queue.`);
    }
  

}

const renderBuildingMap = function(numOfFloors, numOfLifts){

    const elevatorPanel = document.getElementById("elevator-panel")
    // console.log("Total Floors: ", numOfFloors);
    elevatorPanel.innerHTML = ""
    elevatorPanel.style.display = 'none'
    document.body.removeChild(elevatorPanel)
    document.body.style.display = 'block'

    // create floors

    const elevatorContainer = document.createElement('div')
    elevatorContainer.className = 'elevator-container'
    document.body.appendChild(elevatorContainer)

    // Add back on top left
    const backButton = document.createElement('button')
    backButton.className = 'button back-button'
    backButton.id = 'back-button'
    backButton.innerHTML = 'Back'
    backButton.addEventListener('click', function(){
      location.reload()
    })
    elevatorContainer.appendChild(backButton)

    for(let i = numOfFloors; i>=1;i--){

        const floorContainer = document.createElement('div')
        floorContainer.className = 'floor-container'

        const buttonContainer = document.createElement('div')
        buttonContainer.className = 'button-container'

        const upButton = document.createElement('button')
        upButton.addEventListener('click', function(){
          liftController(upButton)
        })
        upButton.className = 'button up-button'
        upButton.style.padding = '5px'
        upButton.dataset.floor = i
        upButton.dataset.direction = 'up'
        const upAngleImg = document.createElement('img')
        upAngleImg.src = 'assets/angle-up-solid.svg'
        upButton.appendChild(upAngleImg)

        // Remove up button from topmost floor
        if(i == numOfFloors){
          upButton.style.display = 'none'
        }
        // upButton.innerHTML = "Up"

        const downButton = document.createElement('button')
        downButton.addEventListener('click', function(){
          liftController(downButton)
        })
        downButton.className = 'button down-button'
        downButton.style.padding = '5px'
        downButton.dataset.floor = i
        downButton.dataset.direction = 'down'
        const downAngleImg = document.createElement('img')
        downAngleImg.src = 'assets/angle-down-solid.svg'
        downButton.appendChild(downAngleImg)
        
        // Remove down button on ground floor
        if(i == 1){
          downButton.style.display = 'none'
        }
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
  
    for (let liftIndex = 1; liftIndex <= numOfLifts; liftIndex++) {
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