function syntaxHighlight(obj) {
    let json = JSON.stringify(obj, undefined, 4);
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

function print(elementId, obj) {
    const element = document.getElementById(elementId);
    element.innerHTML = syntaxHighlight(obj);
    element.setAttribute('style', 'border: 2px solid red');
    if (elementId === 'entity') {
        const entityStateElement = document.getElementById('entityState');
        if (entityStateElement.innerText === "(before update)")
            entityStateElement.innerText = "(after update)";
        else
            entityStateElement.innerText = "(before update)";
    }
    debugger;
    element.removeAttribute('style');

}


// ========= Component
class Component {
    type;

    constructor(type) {
        this.type = type;
    }
}

// =========


// ========= Entity
let globalId = 0;

class Entity {
    id;
    components = {};

    constructor() {
        this.id = globalId++;
    }

    addComponent(component) {
        this.components[component.type] = component;
    }

    removeComponent(componentType) {
        delete this.components[componentType];
    }
}

// =========


// ========= System
class System {
    componentsTypes;

    constructor(componentsTypes) {
        this.componentsTypes = componentsTypes;
    }

    update(entities) {
        // runs child's update with entities that have all of this.componentsTypes
        const relevantEntities = entities.filter(entity =>
            this.componentsTypes.map(componentType => entity.components.hasOwnProperty(componentType))
                .reduce((prev, curr) => prev && curr));
        this._update(relevantEntities)
    }

    _update(entities) {
    }
}

// =========


// ========= Components
// (ComponentsTypes)
const CT = {
    POSITION: "Position",
    VELOCITY: "Velocity",
    GRAVITY: "Gravity",
};

class Position extends Component {
    x;
    y;

    constructor(x, y) {
        super(CT.POSITION);
        this.x = x;
        this.y = y;
    }
}

class Velocity extends Component {
    x;
    y;

    constructor(x, y) {
        super(CT.VELOCITY);
        this.x = x;
        this.y = y;
    }
}

class Gravity extends Component {
    value;

    constructor(value) {
        super(CT.GRAVITY);
        this.value = value;
    }
}

// =========

// ========= Systems
class GravitySystem extends System {
    name = "Gravity System";

    constructor() {
        super([
            CT.VELOCITY,
            CT.GRAVITY,
        ]);
    }

    _update(entities) {
        entities.forEach(entity => {
            print('entity', entity);
            const velocity = entity.components[CT.VELOCITY];
            velocity.y = Math.round((velocity.y + entity.components[CT.GRAVITY].value) * 100) / 100;
            print('entity', entity);
        })
    }
}

class MovementSystem extends System {
    name = "Movement System";

    constructor() {
        super([
            CT.POSITION,
            CT.VELOCITY,
        ]);
    }

    _update(entities) {
        entities.forEach(entity => {
            print('entity', entity);
            const position = entity.components[CT.POSITION];
            const velocity = entity.components[CT.VELOCITY];
            position.x = Math.round((position.x + velocity.x) * 100) / 100;
            position.y = Math.round((position.y + velocity.y) * 100) / 100;
            print('entity', entity);
        })
    }
}

class RenderSystem extends System {
    name = "Render System";
    canvas;
    ctx;

    constructor() {
        super([
            CT.POSITION,
        ]);
        this.canvas = document.getElementById('canvas');
        this.canvas.width = window.innerWidth * 0.7;
        this.canvas.height = window.innerHeight;
        this.ctx = this.canvas.getContext("2d");
    }

    _update(entities) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        entities.forEach(entity => {
            print('entity', entity);
            const position = entity.components[CT.POSITION];
            this.ctx.beginPath();
            this.ctx.arc(position.x, this.canvas.height - position.y, 10, 0, Math.PI * 2);
            this.ctx.fill();
            print('entity', entity);
        })
    }
}

// This determines the order in which the systems are called
const systems = [
    new GravitySystem(),
    new MovementSystem(),
    new RenderSystem(),
];
// =========

const entities = [];

const ball = new Entity();
ball.addComponent(new Position(0, 0));
ball.addComponent(new Velocity(50, 60));
ball.addComponent(new Gravity(-3.7));

entities.push(ball);

const ball2 = new Entity();
ball2.addComponent(new Position(30, 30));
ball2.addComponent(new Velocity(30, 50));
ball2.addComponent(new Gravity(-3.7));

entities.push(ball2);


const FPS = 25;
const FRAME_DURATION = 1000 / FPS;


function main() {
    const startTime = new Date();

    systems.forEach(system => {
        print('system', system);
        system.update(entities);
    });

    const currentFrameDuration = new Date() - startTime;
    const delay = Math.max(FRAME_DURATION - currentFrameDuration, 0);
    setTimeout(main, delay);
}

main();