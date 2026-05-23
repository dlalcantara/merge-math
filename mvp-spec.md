I'm building a GitHub Pages game using HTML/CSS/JavaScript (React preferred but not required).

Game Concept

A merge game where players generate and merge integers using math operators.  Visual is minimal, represented using Integers and cells in a grid.  

CORE MECHANICS:

* Operator Controls
  * Contains the Operation symbols, + * - /
  * User can toggle between the operations.  Visually highlight the currently selected operation
  * Only one operation can be toggled at a time.
  * + addition is toggled by default
  * / division uses integer division, no remainder or decimal part
  * Toggling between operations is not an action

* Targets list
  * Contains a list of 10 randomly generated integers.  1 to 1024
  * Sort the list in increasing order.

* Two grids will be displayed, containing cells.  Cells can be empty or contain an item.  Items are represented by a integers.
  * Numbers Grid (3x3)
  * Generators Grid (2x2)

Cell Selection:

* For each grid, track at most one selected cell, visually this is represented by using a highlight.  Empty cells cannot be selected.
* When user clicks on a cell and no cell was previously selected for that grid:
  * If the cell is empty: nothing happens
  * else: select the clicked cell

ACTIONS
* Track ACTIONS performed by the user.  The actions are Cell Movement, Cell Merging, Generation, Target Reached, Merge All, Clear All,

Cell Movement
* When user clicks on a different cell with a cell previously selected for that grid:
  * If the selected cell is empty: 
    * Move the contents in the selected cell to the clicked cell
    * Clear the selection

Cell Merging
* When user clicks on a different cell with a cell previously selected for that grid:
  * If the selected cell is not empty: 
      * remove the selected cell, 
      * Apply the currently toggled operation to the value of selected and target cell.
      * Set the value of the target cell to the result of the operation
      * Clear the selection

Generate Number
* When user clicks on a selected cell in the Generators grid
  * If there is an empty cell in the Numbers grid:
    * Generate the Generator's value in the Numbers grid
    * Retain the Generator Selection

Target Reached
* When user clicks on a number in the Target List
  * If there is a cell in the Numbers grid with the same value as the Target:
    * Remove the cell in the Numbers grid
    * Remove the target

Merge All
* There is a "Merge All Numbers" button on screen.  It is disabled if the operation toggled is - and /   When "Merge All Numbers" is cicked: 
    * Compute the result by applying the toggled operation (+ or *) to all Numbers in the grid (sum or product respectively).  
    * Remove all cells from the Numbers grid. 
    * Create a cell containing the result as the value.  
    * Clear the selection 

Generate Generator
* There is a "Generate Generator" button on screen.  When clicked:
  * If there is an empty cell in the Generators grid:
    * Generate a Generator with value 1 in the Generator's Grid

Clear Numbers Grid button
* When clicked: Asks the user if all numbers are to be removed
  * If yes, empty the Numbers grid.  Clear the Selection

Clear Generators Grid button
* When clicked Asks the user if all generators are to be removed
  * If yes, empty the Generators grid.  Clear the Selection

UNDO Button
* All actions can be undone.
* When clicked, reverts to the previous state of Numbers Grid and Generators Grid.
* Action Score tracker should also be reverted

ACTION Score Tracker
* Serves as the score for the game.
  * Increments by 1 for every ACTION except for Movements

GAME WIN
* The game ends when the target list is empty
    