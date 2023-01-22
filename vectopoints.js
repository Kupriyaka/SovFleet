'use strict'

class V2 {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
    length() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2))
    }
    angle() {
        let angle = Math.atan(this.y / this.x)
        if (this.x < 0) {
            angle += Math.PI
        }
        return angle
    }
}

function angleBetweenPoints(centerPoint, point) {
    let vec = new V2(point.x - centerPoint.x, point.y - centerPoint.y)
    return Math.atan(vec.y / vec.x)
}

function rotateVector(vec, angle) {
    let radius = vec.length()
    angle += vec.angle()
    return new V2(radius * Math.cos(angle), radius * Math.sin(angle))
}

function rotatedVector(radius, angle) {
    return new V2(radius * Math.cos(angle), radius * Math.sin(angle))
}

function dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y
}

function unit(vec) {
    let len = vec.length()
    return new V2(vec.x / len, vec.y / len)
}

function startFromFirstPoint(points) {
    startDrawing(poly.points[0].x, poly.points[0].y)
}

function fillDrawing(color) {
    ctx.fillStyle = color
    ctx.fill()
}

function connectPoints(points) {
    points.forEach(elem => {
        ctx.lineTo(elem.x, elem.y)
    })
}

function rotatePoints(points, angle) {
    return points.map(point => {
        return rotateVector(point, angle)
    })
}

function dislocatePoints(points, pos) {
    return points.map(point => {
        point.x += pos.x
        point.y += pos.y
        return point
    })
}

function pointsToPoses(poly) {
    let points = rotatePoints(poly.points, poly.angle)
    points = dislocatePoints(points, poly.pos)
    return points
}

function drawPolygon(poly) {
    let poses = pointsToPoses(poly)
    startDrawing(poses)
    connectPoints(poses)
    fillDrawing(poly.color)
}

function startDrawing(x, y) {
    ctx.beginPath()
    ctx.moveTo(x, y)
}

function startFromFirstPoint(points) {
    startDrawing(poly.points[0].x, poly.points[0].y)
}

function fillDrawing(color) {
    ctx.fillStyle = color
    ctx.fill()
}

function connectPoints(points) {
    points.forEach(elem => {
        ctx.lineTo(elem.x, elem.y)
    })
}

function rotatePoints(points, angle) {
    return points.map(point => {
        return rotateVector(point, angle)
    })
}

function dislocatePoints(points, pos) {
    return points.map(point => {
        point.x += pos.x
        point.y += pos.y
        return point
    })
}

function pointsToPoses(poly) {
    let points = rotatePoints(poly.points, poly.angle)
    points = dislocatePoints(points, poly.pos)
    return points
}

function drawPolygon(poly) {
    let poses = pointsToPoses(poly)
    startDrawing(poses)
    connectPoints(poses)
    fillDrawing(poly.color)
}

function clearScreen() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.height)
}

function drawCornerText(textInput, parameter, downOffset) {
    let textsize = 'bold ' + canvas.width/SizeMultiplier/50 + 'px Arial';
    drawText(camera.x-(canvas.width+50000)/SizeMultiplier/50, camera.y-(canvas.width-downOffset*1000+50000)/SizeMultiplier/50, textInput, 0, textsize);
    drawText(camera.x-(canvas.width+40000)/SizeMultiplier/50, camera.y-(canvas.width-downOffset*1000+50000)/SizeMultiplier/50, parameter, 0, textsize);
}
