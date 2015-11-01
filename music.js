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
        this.canvas_offset_left = Elements.canvas.offsetLeft;
        this.canvas_offset_top = Elements.canvas.offsetTop;

        // Set appearance features
        Elements.context.lineWidth = 5;
        this.radius = 50;

        // Clear screen and get ready
        this.stop();
    },

    start : function() {
        var movement = new MovementVector(
                Math.random() * this.width,
                Math.random() * this.height,
                0, 0);
        movement.random_velocity();
        this.spheres.push(new Sphere(movement, this.radius));

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
            var sph = Simulation.spheres[i];
            for (var n = parseInt(i) + 1; n < Simulation.spheres.length; n++) {
                sph.check_collision_with_sphere(Simulation.spheres[n]);
            }
            sph.check_collision_with_wall();
            sph.update_position();
            sph.draw();
        }

        Simulation.animation = window.requestAnimationFrame(Simulation.main_loop);
    },

    clear : function() {
        Elements.context.clearRect(0, 0, this.width, this.height);
    },

    place_sphere : function(e) {
        var movement = new MovementVector(
                e.clientX - Simulation.canvas_offset_left,
                e.clientY - Simulation.canvas_offset_top,
                0, 0);
        movement.random_velocity();
        Simulation.spheres.push(new Sphere(movement, Simulation.radius));
    }
};

function Sphere(movementvector, radius) {
    this.mv = movementvector;
    this.r = radius;
    this.color = "rgba(10, 10, 200, 1)";

    this.check_collision_with_wall = function() {
        if (this.mv.dx() > this.distance_to_right_wall() ||
            this.mv.dx() < this.distance_to_left_wall()) {
            this.mv.x -= this.mv.dx();
            this.mv.angle = Math.PI - this.mv.angle;
        }

        if (this.mv.dy() > this.distance_to_bottom_wall() ||
            this.mv.dy() < this.distance_to_top_wall()) {
            this.mv.y -= this.mv.dy();
            this.mv.angle = Math.PI * 2 - this.mv.angle;
        }

        /*if (this.distance_to_top_wall() > -1) {*/
        /*this.mv.y = this.r + 2;*/
        /*}*/

        /*if (this.distance_to_bottom_wall() < 1) {*/
        /*this.mv.y = Simulation.height - (this.r + 2);*/
        /*}*/

        /*if (this.distance_to_left_wall() > -1) {*/
        /*this.mv.x = this.r + 2;*/
        /*}*/

        /*if (this.distance_to_right_wall() < 1) {*/
        /*this.mv.x = Simulation.width - (this.r + 2);*/
        /*}*/
    };

    this.check_collision_with_sphere = function(other) {
        var npos = this.mv.next_position();
        var nother = other.mv.next_position();

        if (npos.distance(nother) > this.r + other.r)
            return;

        var intersection_plane_angle = Math.PI / 2 +
            Math.atan((nother.y - npos.y) / (nother.x - npos.x));
        this.mv.next_angle = 2 * intersection_plane_angle - this.mv.angle;
        /*this.mv.mag = this.mv.dot(other.mv);*/

        var intersection_plane_angle = Math.PI / 2 +
            Math.atan((npos.y - nother.y) / (npos.x - nother.x));
        other.mv.next_angle = 2 * intersection_plane_angle - other.mv.angle;
        /*other.mv.mag = other.mv.dot(this.mv);*/
    };

    this.distance_to_right_wall = function() {
        return Simulation.width - (this.mv.x + this.r);
    };

    this.distance_to_left_wall = function() {
        return 0 - (this.mv.x - this.r);
    };

    this.distance_to_bottom_wall = function() {
        return Simulation.height - (this.mv.y + this.r);
    };

    this.distance_to_top_wall = function() {
        return 0 - (this.mv.y - this.r);
    };

    this.update_position = function() {
        this.mv.update_position();
    };

    this.draw = function() {
        Elements.context.beginPath();
        Elements.context.arc(this.mv.x, this.mv.y, this.r, 0, 2 * Math.PI, true);
        Elements.context.strokeStyle = this.color;
        Elements.context.stroke();
        Elements.context.closePath();
    };
}

function MovementVector(x, y, angle, magnitude) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.mag = magnitude;
    this.next_angle = null;

    this.distance = function(other) {
        return Math.sqrt(Math.pow(other.x - this.x, 2) +
                Math.pow(other.y - this.y, 2));
    };

    this.dx = function() {
        return Math.cos(this.angle) * this.mag;
    };

    this.dy = function() {
        return Math.sin(this.angle) * this.mag;
    };

    this.dot = function(other) {
        return this.mag * other.mag * Math.cos(other.angle - this.angle);
    };

    this.update_position = function() {
        if (this.next_angle != null) {
            this.angle = this.next_angle;
            this.next_angle = null;
        }
        this.x += Math.round(this.dx());
        this.y += Math.round(this.dy());
    };

    this.next_position = function() {
        var mv = new MovementVector(this.x, this.y, this.angle, this.mag);
        mv.update_position();
        return mv;
    };

    this.random_velocity = function() {
        this.mag = Math.random() * 2 + 2;
        this.angle = Math.random() * 2 * Math.PI;
    };
}
