from flask import Flask, render_template, request, redirect, send_from_directory

app=Flask(__name__)

@app.route('/')
def simulator():#a function that returns the simulator page taking inputs from the javascript file
    return render_template('simulator.html')
    
@app.route('/simulator.css')
def simulator_css():# to access the css folder for the webpage
    return send_from_directory('templates', 'simulator.css')

@app.route('/simulator.js')
def simulator_js():#to access the javascript file containg the details for the simulator
    return send_from_directory('templates', 'simulator.js')


if __name__=="__main__":
    app.run(debug=True)