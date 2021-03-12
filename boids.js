export default class World {
    constructor({
        width,
        height,
        initialBoidCount
    } = {}) {
        this.width = width;
        this.height = height;

        this.boids = [];

        if(initialBoidCount)
            for(let index = 0; index < initialBoidCount; index++)
                this.addBoid();
    }

    /**
     * Add a boid to the world.
     * 
     * @param {BoidOptions} options options for the boid 
     */
    addBoid({
        x = Math.random() * this.width,
        y = Math.random() * this.height,
        angle = Math.random() * 2 * Math.PI,
        speed = Math.random() + 0.5
    } = {}) {
        this.boids.push({
            x: x,
            y: y,
            angle: angle,
            speed: speed,

            newAngle: 0,
            newSpeed: 0
        });
    }

    /**
     * Gets the neighbors of a specific boid.
     * 
     * @param {Boid} target the target to find the neighbors of
     * @param {number} radius the size of the neighborhood to consider
     * 
     * @returns the neighbors of the specified boid
     */
    getNeighbors(target, radius) {
        return this.boids.filter(boid => {
            if(boid === target)
                return false;
            
            const dx = Math.abs(boid.x - target.x);
            const dy = Math.abs(boid.y - target.y);

            return dx * dx + dy * dy < radius * radius;
        });
    }

    /**
     * Updates the boids in the world.
     */
    update() {
        for(const boid of this.boids) {
            const neighbors = this.getNeighbors(boid, 100);

            let xInfluence = 0;
            let yInfluence = 0;

            let speedInfluence = 0;

            if(neighbors.length > 0) {
                // same heading
                const aAngle = averageAngle(neighbors);
                xInfluence += Math.cos(aAngle) * 0.01;
                yInfluence += Math.sin(aAngle) * 0.01;

                // stay together
                const aPosition = averagePosition(neighbors);
                xInfluence += (aPosition.x - boid.x) * 0.001;
                yInfluence += (aPosition.y - boid.y) * 0.001;

                // don't collide
                for(const neighbor of neighbors) {
                    const dx = boid.x - neighbor.x;
                    const dy = boid.y - neighbor.y;
                    const distanceSquared = dx * dx + dy * dy;

                    xInfluence += dx / (distanceSquared / 100 + 1) * 0.01;
                    yInfluence += dy / (distanceSquared / 100 + 1) * 0.01;
                }

                // same speed
                speedInfluence = (averageSpeed(neighbors) - boid.speed) * 0.1;
            }

            // random noise
            xInfluence += (Math.random() * 2 - 1) * 0.01;
            yInfluence += (Math.random() * 2 - 1) * 0.01;

            speedInfluence += (Math.random() * 2 - 1) * 0.01;

            boid.newAngle = Math.atan2(Math.sin(boid.angle) + yInfluence, Math.cos(boid.angle) + xInfluence);
            boid.newSpeed = Math.min(Math.max(boid.speed + speedInfluence, 0.5), 2);
        }

        for(const boid of this.boids) {
            boid.angle = boid.newAngle;
            boid.speed = boid.newSpeed;

            boid.x += Math.cos(boid.angle) * boid.speed;
            boid.y += Math.sin(boid.angle) * boid.speed;

            if(boid.x >= this.width) boid.x = boid.x % this.width;
            if(boid.x <= 0) boid.x = boid.x % this.width + this.width;

            if(boid.y >= this.height) boid.y = boid.y % this.height;
            if(boid.y <= 0) boid.y = boid.y % this.width + this.height;
        }
    }
}


/**
 * Finds the average angle of a given list of boids.
 * 
 * @param {Boid[]} boids the boids to find the average angle of
 * 
 * @returns the average angle of the given boids
 */
function averageAngle(boids) {
    let x = 0;
    let y = 0;

    for(const boid of boids) {
        x += Math.cos(boid.angle);
        y += Math.sin(boid.angle);
    }

    return Math.atan2(y, x);
}

/**
 * Finds the average position of a given list of boids.
 * 
 * @param {Boid[]} boids the boids to find the average position of
 * 
 * @returns the average positoin of the given boids
 */
function averagePosition(boids) {
    let totalX = 0;
    let totalY = 0;

    for(const boid of boids) {
        totalX += boid.x;
        totalY += boid.y;
    }

    return {
        x: totalX / boids.length,
        y: totalY / boids.length
    };
}

/**
 * Finds the average speed of a given list of boids.
 * 
 * @param {Boid[]} boids the boids to find the average speed of
 * 
 * @returns the average speed of the given boids
 */
function averageSpeed(boids) {
    let totalSpeed = 0;

    for(const boid of boids)
        totalSpeed += boid.speed;

    return totalSpeed / boids.length;
}
