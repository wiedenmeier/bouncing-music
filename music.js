var Elements = {
    init : function() {
        this.canvas = document.getElementById("main_canvas");
        this.header = document.getElementsByTagName("header")[0];
        this.start_sign = document.getElementById("start_sign");
        this.context = this.canvas.getContext("2d");
    }
};

var EventHandler = {
    init : function() {
        Elements.canvas.onclick = this.handle_canvas_click;
        window.onresize = this.size_canvas;
    },

    handle_canvas_click : function(e) {
        if (Simulation.playing)
            Simulation.place_sphere(e);
        else
            Simulation.start();
    },

    size_canvas : function() {
        Elements.canvas.width = window.innerWidth - 42;
        Elements.canvas.height = window.innerHeight -
            (Elements.header.offsetHeight + 60);
    }
};

var Simulation = {
    init : function() {
        // Set up canvas
        EventHandler.size_canvas();

        // Set dimensions
        this.width = Elements.canvas.width;
        this.height = Elements.canvas.height;

        // Set appearance features
        Elements.context.lineWidth = 5;
        this.radius = 150;

        // Clear screen and get ready
        this.stop();
    },

    start : function() {
        var movement = new MovementVector(
                Math.random() * this.width,
                Math.random() * this.height,
                Math.random() * 4 - 2,
                Math.random() * 4 - 2);
        this.spheres.push(new Sphere(movement, 50));

        this.playing = true;
        this.animation = window.requestAnimationFrame(Simulation.main_loop);
    },

    stop : function() {
        window.cancelAnimationFrame(this.animation);
        Elements.context.clearRect(0, 0, this.width, this.height);
        this.playing = false;
        this.spheres = [];
    },

    main_loop : function() {
        Simulation.clear();

        for (i in Simulation.spheres) {
            Simulation.spheres[i].update_position();
            Simulation.spheres[i].draw();
        }

        Simulation.animation =
            window.requestAnimationFrame(Simulation.main_loop);
    },

    clear : function() {
        Elements.context.clearRect(0, 0, this.width, this.height);
    },

    place_sphere : function(e) {
    }
};

function Sphere(movementvector, radius) {
    this.mv = movementvector;
    this.r = radius;
    this.color = "rgba(50, 100, 200)";

    this.update_position = function() {
        this.mv.update_position();
    };

    this.draw = function() {
        Elements.context.beginPath();
        Elements.context.arc(this.mv.x, this.mv.y, this.r,
                0, 2 * Math.PI, true);
        Elements.context.stroke();
        Elements.context.closePath();
    }
}

function MovementVector(x, y, dx, dy) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;

    this.update_position = function() {
        this.x += dx;
        this.y += dy;
    };
}
