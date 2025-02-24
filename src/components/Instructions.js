import React from 'react';

const Instructions = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Welcome to FGOCanItFarmReactApp</h1>
      <h2>How to Use</h2>
      <p>Welcome to the FGOCanItFarmReactApp! This application allows you to simulate team compositions and strategies for the game Fate/Grand Order. Below is a detailed guide on how to interact with the application.</p>

      <h3>Teams Page</h3>
      <p>The Teams page is the main functional component of the application. Here, you can select and configure your team of servants, choose a Mystic Code, and set up commands for simulation.</p>

      <h4>Selecting Your Team</h4>
      <ol>
        <li>Use the <strong>Filter Section</strong> to filter servants by rarity, class, NP type, and attack type. You can also search for specific servants using the search bar.</li>
        <li>Click on a servant from the <strong>Servant Selection</strong> or <strong>Common Servants Grid</strong> to add them to your team. You can have up to 6 servants in your team.</li>
        <li>To remove a servant from your team, click on the <strong>Clear Team</strong> button.</li>
      </ol>

      <h4>Configuring Servant Effects</h4>
      <ol>
        <li>Click on a servant in your team to open the configuration panel.</li>
        <li>In the configuration panel, you can set various effects for the servant, such as:
          <ul>
            <li>Append 2</li>
            <li>Append 5</li>
            <li>Attack</li>
            <li>Atk Up</li>
            <li>Arts Up</li>
            <li>Quick Up</li>
            <li>Buster Up</li>
            <li>NP Up</li>
            <li>Initial Charge</li>
          </ul>
        </li>
      </ol>

      <h4>Selecting a Mystic Code</h4>
      <ol>
        <li>Scroll down to the <strong>Select Mystic Code</strong> section.</li>
        <li>Choose a Mystic Code from the available options.</li>
      </ol>

      <h4>Selecting a Farming Node</h4>
      <ol>
        <li>Navigate to the <strong>Select Farming Node</strong> page.</li>
        <li>Choose a quest from the available options.</li>
      </ol>

      <h4>Setting Up Commands</h4>
      <ol>
        <li>Navigate to the <strong>Input Commands</strong> page.</li>
        <li>Use the <strong>Command Input Menu</strong> to add commands for the simulation. You can add commands such as "End Turn" and "Use NP".</li>
        <li>The commands will be displayed in the <strong>Commands</strong> section.</li>
        <li>To clear all commands, click on the <strong>Clear Commands</strong> button.</li>
      </ol>

      <h4>Submitting Your Team</h4>
      <ol>
        <li>Once you have configured your team, selected a Mystic Code, and set up commands, click on the <strong>Submit Team</strong> button.</li>
        <li>A confirmation modal will appear, displaying the final values that will be submitted.</li>
        <li>Click on <strong>Confirm</strong> to submit your team or <strong>Cancel</strong> to make changes.</li>
      </ol>

      <h3>Future Features</h3>
      <p>We are currently working on adding more features to the application, including data analysis and log analysis. Stay tuned for updates!</p>

      <p>If you have any questions or feedback, please contact us at <a href="mailto:support@fgocanitfarm.com">support@fgocanitfarm.com</a>.</p>
    </div>
  );
};

export default Instructions;