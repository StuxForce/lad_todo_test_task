class Task {
	constructor(msg, place) {
		if (!Task.lastID) {
			Task.lastID = 0;
		}
		Task.lastID++;
		Task.activeTaskID = 0;
		this.id = Task.lastID;
		this.msg = msg;
		this.place = place;
		this.colorClass = 'info';
		this.timerStartVal = 25; // in seconds
		this.timerCurVal = 0;
		this.timerIsOn = false;
		this.tomatos = 0;
		this.taskIsComplete = false;
	}

	removeTask() {
		this.taskElem.remove();
	}

	clickTimer() {
		if (Task.activeTaskID
			&& Task.activeTaskID !== this.id
		) {
			alert('Вы уже работаете над одной задачей! Пожалуйста, сначала закончите ее!');
			return;
		}

		this.rebaseTask('warning');

		if (!this.timerCurVal) {
			this.timerCurVal = this.timerStartVal;
		}

		if (!this.timerID) {
			this.startTimer();
		} else {
			this.stopTimer();
		}

		this.printTimerData();
	}

	stopTimer() {
		Task.activeTaskID = 0;
		this.timerIsOn = false;
		clearInterval(this.timerID);
		delete this.timerID;
	}

	startTimer() {
		Task.activeTaskID = this.id;
		this.timerIsOn = true;
		this.timerID = setInterval(() => {
			if (this.timerCurVal === 0) {
				this.stopTimer();
				this.tomatos++;
				Pause.start();
				this.printTaskResult();
				return;
			}
			this.timerCurVal--;
			this.printTimerData();
		}, 1000);
	}

	printTimerData(restoreIcon = '') {
		const iconClass = (this.timerIsOn) ? 'pause2' : 'play3';
		let timerData = `<span class="icon-${iconClass}"></span> ${this.timerCurVal.toString().toHHMMSS()}`;
		if (restoreIcon) {
			timerData = '<span class="icon-hour-glass"></span>';
		}
		this.timerBtn.innerHTML = timerData;
	}

	printTaskResult() {
		let completeMsg = '';
		this.printTimerData('restoreIcon');
		if (this.taskIsComplete) {
			completeMsg = '<strong>Завершена!</strong>';
			this.taskValue.innerHTML = `<del>${this.msg}</del>`;
		}
		this.taskResult.innerHTML = `${completeMsg} Затрачено ${this.tomatos} помидор(a).`;
	}

	closeTask() {
		this.taskIsComplete = true;
		this.stopTimer();
		this.rebaseTask('success', 'beforeEnd');
		this.printTimerData('restoreIcon');
		this.printTaskResult();
		this.timerBtn.remove();
		this.closeBtn.remove();
	}

	rebaseTask(color, position) {
		this.colorClass = color;
		this.taskElem.remove();
		this.printTask(position);
		this.printTaskResult();
	}

	printTask(position = 'afterBegin') {
		const task = `
			<div class="row" id="task${this.id}">
				<div class="col">
					<div class="alert alert-${this.colorClass}">
						<div class="row">
							<div class="col-auto mr-auto">							
								<div id="taskValue${this.id}">${this.msg}</div>
								<small id="taskResult${this.id}" class="text-muted"></small>
							</div>
							<div class="col-auto">
								<button id="timerBtn${this.id}" type="button" class="btn btn-primary">
									<span class="icon-hour-glass"></span>
								</button>

								<button id="closeBtn${this.id}" type="button" class="btn btn-success">
									<span class="icon-checkmark"></span>
								</button>

								<button id="deleteBtn${this.id}" type="button" class="btn btn-danger">
									<span class="icon-cross"></span>
								</button>
							</div>							
						</div>
					</div>
				</div>
			</div>
		`;

		this.place.insertAdjacentHTML(position, task);
		this.taskElem = document.getElementById(`task${this.id}`);
		this.taskValue = document.getElementById(`taskValue${this.id}`);
		this.taskResult = document.getElementById(`taskResult${this.id}`);
		this.timerBtn = document.getElementById(`timerBtn${this.id}`);
		this.closeBtn = document.getElementById(`closeBtn${this.id}`);
		this.deleteBtn = document.getElementById(`deleteBtn${this.id}`);

		this.timerBtn.addEventListener('click', this.clickTimer.bind(this), false);
		this.deleteBtn.addEventListener('click', this.removeTask.bind(this));
		this.closeBtn.addEventListener('click', this.closeTask.bind(this));
	}
}

class Pause {
	constructor() {
		Pause.area = document.getElementById('pauseArea');
		Pause.timerArea = document.getElementById('pauseTimer');
		Pause.count = 0;
		Pause.timerShortValue = 3; // in seconds
		Pause.timerLongValue = 15; // in seconds
	}

	static start() {
		Pause.count++;

		// long pause after each 4 tomato
		if (Pause.count > 0
			&& Pause.count % 4 === 0
		) {
			Pause.timerCurVal = Pause.timerLongValue;
		} else {
			Pause.timerCurVal = Pause.timerShortValue;
		}

		Pause.timerID = setInterval(() => {
			if (Pause.timerCurVal === 0) {
				Pause.stop();
			}
			Pause.timerCurVal--;
			Pause.timerArea.innerHTML = Pause.timerCurVal.toString().toHHMMSS();
		}, 1000);

		Pause.timerArea.innerHTML = Pause.timerCurVal.toString().toHHMMSS();
		Pause.area.style.display = 'block';
	}

	static stop() {
		Pause.area.style.display = 'none';
		clearInterval(Pause.timerID);
	}
}

// https://stackoverflow.com/questions/6312993/javascript-seconds-to-time-string-with-format-hhmmss
String.prototype.toHHMMSS = function () {
	const secNum = parseInt(this, 10); // don't forget the second param
	let hours = Math.floor(secNum / 3600);
	let minutes = Math.floor((secNum - (hours * 3600)) / 60);
	let seconds = secNum - (hours * 3600) - (minutes * 60);

	if (hours < 10) { hours = `0${hours}`; }
	if (minutes < 10) { minutes = `0${minutes}`; }
	if (seconds < 10) { seconds = `0${seconds}`; }
	return `${hours}:${minutes}:${seconds}`;
};


const pauseTimer = new Pause();
const tasksArea = document.getElementById('todoArea');
const inputField = document.getElementById('inputField');
const addBtn = document.getElementById('addBtn');

inputField.addEventListener('keypress', (e) => {
	if (e.keyCode !== 13) return;
	addNewTask();
});

addBtn.addEventListener('click', () => {
	addNewTask();
});

function addNewTask() {
	if (!inputField.value) {
		alert('Пустые задачи создавать бессмысленно :)');
		return;
	}

	const curTask = new Task(inputField.value, tasksArea);
	curTask.printTask();

	inputField.value = '';
	inputField.focus();
}
