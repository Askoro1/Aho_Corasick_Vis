"use strict";

// Aho-Corasick algorithm

class Vertex {
  constructor(p = -1, char = "") {
    this.parent = p;
    this.edge_symbol = char;
  }

  next_vertices = new Map();
  is_terminal = false;
  parent = -1;
  edge_symbol;
  pattern_number = 0;
  automaton_jumps = new Map();
  suffix_link = -1;
  suffix_term_link = -1;
}

class Trie {
  constructor() {
    this.#vertices = []
    this.#vertices.push(new Vertex());
    this.#trie_layout = new TrieLayout(750, 400);
    this.#trie_layout.show();
  }

  async addNewString(str, str_number, pattern_input_highlighted_dist) {
    let ind = 0;
    for (let char of str) {
      if (!this.#vertices[ind].next_vertices.has(char)) {
        this.#vertices.push(new Vertex(ind, char));
        this.#vertices[ind].next_vertices.set(char, this.#vertices.length - 1);
        // layout
        this.#trie_layout.stop();
        this.#trie_layout.addNode(char, ind);
        this.#trie_layout.unhighlightNode(ind);
        this.#trie_layout.highlightNode(this.#vertices.length - 1);
        this.#trie_layout.show();
        //
        ind = this.#vertices[ind].next_vertices.get(char);
      } else {
        // layout
        this.#trie_layout.stop();
        this.#trie_layout.unhighlightNode(ind);
        //
        ind = this.#vertices[ind].next_vertices.get(char);
        // layout
        this.#trie_layout.highlightNode(ind);
        this.#trie_layout.show();
        //
      }
      //layout
      let input = document.getElementById('highlighted_pattern_field');
      ++pattern_input_highlighted_dist[1];
      input.focus();
      input.setSelectionRange(pattern_input_highlighted_dist[0], pattern_input_highlighted_dist[1]);
      await sleep(0.5 * ms_in_s);
      //
    }
    if (ind > 0 && !this.#vertices[ind].is_terminal) {
      this.#vertices[ind].is_terminal = true;
      //layout
      this.#trie_layout.stop();
      this.#trie_layout.unhighlightNode(ind);
      this.#trie_layout.makeNodeTerminal(ind);
      this.#trie_layout.highlightNode(0);
      this.#trie_layout.show();
      //
      this.#vertices[ind].pattern_number = str_number;
    } else {
      //layout
      this.#trie_layout.stop();
      this.#trie_layout.unhighlightNode(ind);
      this.#trie_layout.highlightNode(0);
      this.#trie_layout.show();
      //
    }
  }

  get vertices() {
    return this.#vertices;
  }

  get trie_layout() {
    return this.#trie_layout;
  }

  #vertices;
  #trie_layout;
}

class AhoCorasickWrapper {
  constructor() {
    this.#trie = new Trie();
    this.#patterns = [];
    this.#patterns_pos = [];
  }

  async addNewPattern() {
    // layout
    let input = document.getElementById('pattern_field');
    let pattern = input.value;
    if (pattern.length > 0) {
      let pattern_input_highlighted_dist = [0, 0];
      input.setAttribute("id", "highlighted_pattern_field");
      input.setAttribute("readonly", "true");

      input.focus();

      let on_select_unchanged = function() {
        input.setSelectionRange(pattern_input_highlighted_dist[0], pattern_input_highlighted_dist[1]);
      };

      input.addEventListener("select", on_select_unchanged);
      //
      // logic + layout
      await this.#trie.addNewString(pattern, this.#patterns.length, pattern_input_highlighted_dist);
      this.#patterns.push(pattern);
      this.#patterns_pos.push([]);
      //
      // layout
      let pattern_table = document.getElementById("pattern_table");

      let info_number = document.createElement("div");
      info_number.setAttribute("class", "info_label");
      info_number.textContent = String(this.#patterns.length) + '.';

      let info_square = document.createElement("div");
      info_square.setAttribute("class", "info_square");
      info_square.style["background-color"] = randomColor({
        format: 'rgba',
        alpha: 0.7
      });

      let info_label = document.createElement("div");
      info_label.setAttribute("class", "info_label");
      info_label.textContent = pattern;

      if (this.#patterns.length <= 4) {
        pattern_table.children[this.#patterns.length].appendChild(info_number);
        pattern_table.children[this.#patterns.length].appendChild(info_square);
        pattern_table.children[this.#patterns.length].appendChild(info_label);
      } else {
        let info_pattern_cell = document.createElement("div");
        info_pattern_cell.setAttribute("class", "info_pattern_cell");
        info_pattern_cell.appendChild(info_number);
        info_pattern_cell.appendChild(info_square);
        info_pattern_cell.appendChild(info_label);
        pattern_table.appendChild(info_pattern_cell);
      }

      input.removeEventListener("select", on_select_unchanged);

      input.removeAttribute("id");
      input.setAttribute("id", "pattern_field");
      input.removeAttribute("readonly");
      pattern_input_highlighted_dist = [0, 0];
      input.value = "";
      input.blur();
      let counter = document.getElementsByClassName('counter')[0];
      counter.textContent = '';
      //
    }
  }

  async getSuffixLink(vertex_ind) {
    // layout
    if (vertex_ind === 0) {
      this.pushEventToLog("Getting suffix link from root");
    } else {
      this.pushEventToLog("Getting suffix link from " + this.#trie.vertices[vertex_ind].edge_symbol);
    }
    await sleep(0.75 * ms_in_s);

    this.#trie.trie_layout.stop();
    if (this.#trie.trie_layout.isNodeHighlighted(vertex_ind)) {
      this.#trie.trie_layout.unhighlightNode(vertex_ind);
      this.#trie.trie_layout.show();
      await sleep(0.5 * ms_in_s);
      this.#trie.trie_layout.stop();
    }
    this.#trie.trie_layout.highlightNode(vertex_ind);
    this.#trie.trie_layout.show();
    await sleep(0.5 * ms_in_s);
    //

    if (this.#trie.vertices[vertex_ind].suffix_link === -1) {
      if (vertex_ind === 0) {
        this.pushEventToLog("Suffix link from root is NOT set");
      } else {
        this.pushEventToLog("Suffix link from " + this.#trie.vertices[vertex_ind].edge_symbol + " is NOT set");
      }
      await sleep(0.75 * ms_in_s);

      if (vertex_ind === 0 ||
          this.#trie.vertices[vertex_ind].parent === 0) {
        if (vertex_ind === 0) {
          this.pushEventToLog("We are in root...");
        } else {
          this.pushEventToLog("We are in a neighbor of root...");
        }
        await sleep(0.75 * ms_in_s);
        this.pushEventToLog("...So the suffix link leads to root")
        await sleep(0.75 * ms_in_s);

        this.#trie.vertices[vertex_ind].suffix_link = 0;
      } else {

        // layout
        this.#trie.trie_layout.stop();
        this.#trie.trie_layout.addLink(vertex_ind, this.#trie.vertices[vertex_ind].parent, 'd');
        this.#trie.trie_layout.highlightLink(vertex_ind, this.#trie.vertices[vertex_ind].parent);
        blockExec();
        this.#trie.trie_layout.show();
        while (is_execution_blocked) {
          await sleep(0.05 * ms_in_s);
        }
        this.#trie.trie_layout.stop();
        this.#trie.trie_layout.unhighlightLink(vertex_ind, this.#trie.vertices[vertex_ind].parent);
        this.#trie.trie_layout.removeLastLink();
        this.#trie.trie_layout.show();
        //
        this.pushEventToLog("We're NOT in the root or its neighbor");
        await sleep(0.75 * ms_in_s);
        this.pushEventToLog("We get suffix link of our parent...");
        await sleep(0.75 * ms_in_s);
        let suf_link_parent = await this.getSuffixLink(this.#trie.vertices[vertex_ind].parent);
        this.pushEventToLog("...and jump from it by symbol " + this.#trie.vertices[vertex_ind].edge_symbol);
        await sleep(0.75 * ms_in_s);
        this.#trie.vertices[vertex_ind].suffix_link = await this.jumpTo(suf_link_parent, this.#trie.vertices[vertex_ind].edge_symbol);
      }
    }

    // layout
    if (vertex_ind !== 0) {
      this.#trie.trie_layout.stop();
      if (!this.#trie.trie_layout.isLinkConnectingNodes(vertex_ind, this.#trie.vertices[vertex_ind].suffix_link)) {
        this.#trie.trie_layout.addLink(vertex_ind, this.#trie.vertices[vertex_ind].suffix_link, 's');
      }
      this.#trie.trie_layout.highlightLink(vertex_ind, this.#trie.vertices[vertex_ind].suffix_link);
      blockExec();
      this.#trie.trie_layout.show();
      while (is_execution_blocked) {
        await sleep(0.05 * ms_in_s);
      }
      this.#trie.trie_layout.stop();
      this.#trie.trie_layout.unhighlightLink(vertex_ind, this.#trie.vertices[vertex_ind].suffix_link);
      this.#trie.trie_layout.show();
      await sleep(0.75 * ms_in_s);
      if (this.#trie.trie_layout.isNodeHighlighted(vertex_ind)) {
        this.#trie.trie_layout.stop();
        this.#trie.trie_layout.unhighlightNode(vertex_ind);
        this.#trie.trie_layout.show();
        await sleep(0.75 * ms_in_s);
      }
    }
    //

    return this.#trie.vertices[vertex_ind].suffix_link;
  }

  async jumpTo(vertex_ind, char) {
    // layout
    if (vertex_ind === 0) {
      this.pushEventToLog("Jumping from root by symbol " + char);
    } else {
      this.pushEventToLog("Jumping from " + this.#trie.vertices[vertex_ind].edge_symbol + " by symbol " + char);
    }
    await sleep(0.75 * ms_in_s);
    let stack_obj = document.getElementsByClassName("stack_like")[0];
    let stack_obj_cell = document.createElement("div");
    stack_obj_cell.setAttribute("class", "stack_like_cell");
    stack_obj_cell.textContent = char;
    stack_obj.appendChild(stack_obj_cell);
    stack_obj_cell.style["background-color"] = "rgba(47,255,0,0.42)";
    await sleep(1 * ms_in_s);
    stack_obj_cell.style["background-color"] = "rgba(189, 188, 188, 0.5)";
    stack_obj.scroll({ top: -stack_obj.scrollHeight, behavior: "smooth" });

    this.#trie.trie_layout.stop();
    if (this.#trie.trie_layout.isNodeHighlighted(vertex_ind)) {
      this.#trie.trie_layout.unhighlightNode(vertex_ind);
      this.#trie.trie_layout.show();
      await sleep(0.5 * ms_in_s);
      this.#trie.trie_layout.stop();
    }
    this.#trie.trie_layout.highlightNode(vertex_ind);
    this.#trie.trie_layout.show();
    await sleep(0.75 * ms_in_s);
    //

    if (!this.#trie.vertices[vertex_ind].automaton_jumps.has(char)) {
      if (vertex_ind === 0) {
        this.pushEventToLog("Jump from root by symbol " + char + " is NOT set");
      } else {
        this.pushEventToLog("Jump from " + this.#trie.vertices[vertex_ind].edge_symbol + " by symbol " + char + " is NOT set");
      }
      await sleep(0.75 * ms_in_s);
      if (this.#trie.vertices[vertex_ind].next_vertices.has(char)) {
        if (vertex_ind === 0) {
          this.pushEventToLog("Symbol " + char + " is a neighbor of root");
        } else {
          this.pushEventToLog("Symbol " + char + " is a neighbor of " + this.#trie.vertices[vertex_ind].edge_symbol);
        }
        await sleep(0.75 * ms_in_s);
        this.pushEventToLog("We go to the neighbor state");
        await sleep(0.75 * ms_in_s);

        this.#trie.vertices[vertex_ind].automaton_jumps.set(char, this.#trie.vertices[vertex_ind].next_vertices.get(char));

        //layout
        stack_obj = document.getElementsByClassName("stack_like")[0];
        let stack_obj_cells = document.getElementsByClassName("stack_like_cell");
        let last_stack_obj_cell = stack_obj_cells[stack_obj_cells.length - 1];
        last_stack_obj_cell.style["background-color"] = "rgba(255, 0, 0, 0.3)";
        await sleep(1 * ms_in_s);
        stack_obj.removeChild(last_stack_obj_cell);

        await this.jumpToVis(vertex_ind, char);
        //
      } else {
        if (vertex_ind === 0) {
          this.pushEventToLog("Symbol " + char + " is NOT a neighbor of root");
          await sleep(0.75 * ms_in_s);
          this.pushEventToLog("We stay in the root");
          await sleep(0.75 * ms_in_s);
          this.#trie.vertices[vertex_ind].automaton_jumps.set(char, 0);

          // layout
          stack_obj = document.getElementsByClassName("stack_like")[0];
          let stack_obj_cells = document.getElementsByClassName("stack_like_cell");
          let last_stack_obj_cell = stack_obj_cells[stack_obj_cells.length - 1];
          last_stack_obj_cell.style["background-color"] = "rgba(255, 0, 0, 0.3)";
          await sleep(1 * ms_in_s);
          stack_obj.removeChild(last_stack_obj_cell);
          //
        } else {
          this.pushEventToLog("Symbol " + char + " is NOT a neighbor of " + this.#trie.vertices[vertex_ind].edge_symbol);
          await sleep(0.75 * ms_in_s);
          this.pushEventToLog("We get the suffix link of " + this.#trie.vertices[vertex_ind].edge_symbol + "...");
          await sleep(0.75 * ms_in_s);
          let vertex_suf_link = await this.getSuffixLink(vertex_ind);

          // layout

          this.#trie.trie_layout.stop();
          this.#trie.trie_layout.highlightLink(vertex_ind, vertex_suf_link);
          blockExec();
          this.#trie.trie_layout.show();
          while (is_execution_blocked) {
            await sleep(0.05 * ms_in_s);
          }
          this.#trie.trie_layout.stop();
          this.#trie.trie_layout.unhighlightLink(vertex_ind, vertex_suf_link);
          this.#trie.trie_layout.show();
          await sleep(0.75 * ms_in_s);
          if (this.#trie.trie_layout.isNodeHighlighted(vertex_ind)) {
            this.#trie.trie_layout.stop();
            this.#trie.trie_layout.unhighlightNode(vertex_ind);
            this.#trie.trie_layout.show();
            await sleep(0.75 * ms_in_s);
          }

          //
          this.pushEventToLog("...And jump from it by symbol " + char);
          await sleep(0.75 * ms_in_s);
          let jump = await this.jumpTo(vertex_suf_link, char);

          // layout
          stack_obj = document.getElementsByClassName("stack_like")[0];
          let stack_obj_cells = document.getElementsByClassName("stack_like_cell");
          let last_stack_obj_cell = stack_obj_cells[stack_obj_cells.length - 1];
          last_stack_obj_cell.style["background-color"] = "rgba(255, 0, 0, 0.3)";
          await sleep(1 * ms_in_s);
          stack_obj.removeChild(last_stack_obj_cell);
          //

          this.#trie.vertices[vertex_ind].automaton_jumps.set(char, jump);
        }
      }
    } else {
      if (vertex_ind === 0) {
        this.pushEventToLog("Jump from root by symbol " + char + " is set");
      } else {
        this.pushEventToLog("Jump from " + this.#trie.vertices[vertex_ind].edge_symbol + " by symbol " + char + " is set");
      }
      await sleep(0.75 * ms_in_s);
      this.pushEventToLog("So we perform the jump");
      await sleep(0.75 * ms_in_s);
      //layout
      stack_obj = document.getElementsByClassName("stack_like")[0];
      let stack_obj_cells = document.getElementsByClassName("stack_like_cell");
      let last_stack_obj_cell = stack_obj_cells[stack_obj_cells.length - 1];
      last_stack_obj_cell.style["background-color"] = "rgba(255, 0, 0, 0.3)";
      await sleep(1 * ms_in_s);
      stack_obj.removeChild(last_stack_obj_cell);

      if (!(vertex_ind === 0 && this.#trie.vertices[vertex_ind].automaton_jumps.get(char) === 0)) {
        await this.jumpToVis(vertex_ind, char);
      }
      //
    }

    return this.#trie.vertices[vertex_ind].automaton_jumps.get(char);
  }

  async jumpToVis(vertex_ind, char) {
    this.#trie.trie_layout.stop();
    if (this.#trie.trie_layout.isNodeHighlighted(this.#trie.vertices[vertex_ind].automaton_jumps.get(char))) {
      this.#trie.trie_layout.unhighlightNode(this.#trie.vertices[vertex_ind].automaton_jumps.get(char));
      this.#trie.trie_layout.show();
      await sleep(0.5 * ms_in_s);
      this.#trie.trie_layout.stop();
    }
    this.#trie.trie_layout.highlightNode(this.#trie.vertices[vertex_ind].automaton_jumps.get(char));
    this.#trie.trie_layout.show();
    await sleep(0.75 * ms_in_s);
    this.#trie.trie_layout.stop();
    this.#trie.trie_layout.setPointerType("n");
    this.#trie.trie_layout.setPointerSymbol(char);
    this.#trie.trie_layout.setPointerPath(vertex_ind, this.#trie.vertices[vertex_ind].automaton_jumps.get(char));
    this.#trie.trie_layout.activatePointer();
    this.#trie.trie_layout.highlightLink(vertex_ind, this.#trie.vertices[vertex_ind].automaton_jumps.get(char));
    blockExec();
    this.#trie.trie_layout.show();
    while (is_execution_blocked) {
      await sleep(0.05 * ms_in_s);
    }
    this.#trie.trie_layout.stop();
    this.#trie.trie_layout.resetPointer();
    this.#trie.trie_layout.unhighlightLink(vertex_ind, this.#trie.vertices[vertex_ind].automaton_jumps.get(char));
    this.#trie.trie_layout.show();
    await sleep(0.75 * ms_in_s);
    if (this.#trie.trie_layout.isNodeHighlighted(vertex_ind)) {
      this.#trie.trie_layout.stop();
      this.#trie.trie_layout.unhighlightNode(vertex_ind);
      this.#trie.trie_layout.show();
      await sleep(0.75 * ms_in_s);
    }
  }

  async getTerminalLink(vertex_ind) {
    // layout
    if (vertex_ind === 0) {
      this.pushEventToLog("Getting terminal link from root");
    } else {
      this.pushEventToLog("Getting terminal link from " + this.#trie.vertices[vertex_ind].edge_symbol);
    }
    await sleep(0.75 * ms_in_s);

    this.#trie.trie_layout.stop();
    if (this.#trie.trie_layout.isNodeHighlighted(vertex_ind)) {
      this.#trie.trie_layout.unhighlightNode(vertex_ind);
      this.#trie.trie_layout.show();
      await sleep(0.5 * ms_in_s);
      this.#trie.trie_layout.stop();
    }
    this.#trie.trie_layout.highlightNode(vertex_ind);
    this.#trie.trie_layout.show();
    await sleep(0.5 * ms_in_s);
    //

    if (this.#trie.vertices[vertex_ind].suffix_term_link === -1) {
      if (vertex_ind === 0) {
        this.pushEventToLog("Terminal link from root is NOT set");
      } else {
        this.pushEventToLog("Terminal link from " + this.#trie.vertices[vertex_ind].edge_symbol + " is NOT set");
      }
      await sleep(0.75 * ms_in_s);

      let curr_suf_link = await this.getSuffixLink(vertex_ind);
      if (curr_suf_link === 0) {
        this.pushEventToLog("Suffix link leads to root");
        await sleep(0.75 * ms_in_s);
        this.pushEventToLog("So the terminal link leads to root");
        await sleep(0.75 * ms_in_s);

        this.#trie.vertices[vertex_ind].suffix_term_link = 0;
      } else {
        if (this.#trie.vertices[curr_suf_link].is_terminal) {
          this.pushEventToLog("Suffix link leads to terminal vertex");
          await sleep(0.75 * ms_in_s);
          this.pushEventToLog("So the terminal link leads to it too");
          await sleep(0.75 * ms_in_s);

          this.#trie.vertices[vertex_ind].suffix_term_link = curr_suf_link;
        } else {
          this.pushEventToLog("Suffix link leads to regular vertex");
          await sleep(0.75 * ms_in_s);
          this.pushEventToLog("So we continue going by suffix links");
          await sleep(0.75 * ms_in_s);

          this.#trie.vertices[vertex_ind].suffix_term_link = await this.getTerminalLink(curr_suf_link);
        }
      }
    }

    // layout
    if (vertex_ind !== 0) {
      this.#trie.trie_layout.stop();
      if (this.#trie.trie_layout.isLinkConnectingNodes(vertex_ind, this.#trie.vertices[vertex_ind].suffix_term_link)) {
        this.#trie.trie_layout.setTypeOfLink(vertex_ind, this.#trie.vertices[vertex_ind].suffix_term_link, 't');
      } else {
        this.#trie.trie_layout.addLink(vertex_ind, this.#trie.vertices[vertex_ind].suffix_term_link, 't');
      }
      this.#trie.trie_layout.highlightLink(vertex_ind, this.#trie.vertices[vertex_ind].suffix_term_link);
      blockExec();
      this.#trie.trie_layout.show();
      while (is_execution_blocked) {
        await sleep(0.05 * ms_in_s);
      }
      this.#trie.trie_layout.stop();
      this.#trie.trie_layout.unhighlightLink(vertex_ind, this.#trie.vertices[vertex_ind].suffix_term_link);
      this.#trie.trie_layout.show();
      await sleep(0.75 * ms_in_s);
      if (this.#trie.trie_layout.isNodeHighlighted(vertex_ind)) {
        this.#trie.trie_layout.stop();
        this.#trie.trie_layout.unhighlightNode(vertex_ind);
        this.#trie.trie_layout.show();
        await sleep(0.75 * ms_in_s);
      }
      if (this.#trie.trie_layout.isNodeHighlighted(this.#trie.vertices[vertex_ind].suffix_term_link)) {
        this.#trie.trie_layout.stop();
        this.#trie.trie_layout.unhighlightNode(this.#trie.vertices[vertex_ind].suffix_term_link);
        this.#trie.trie_layout.show();
        await sleep(0.75 * ms_in_s);
      }
    }
    //

    return this.#trie.vertices[vertex_ind].suffix_term_link;
  }

  async searchByTermLinks(vertex_ind, curr_pos) {
    this.pushEventToLog("Now we go by terminal links to the root");
    await sleep(0.75 * ms_in_s);
    while (vertex_ind > 0) {
      if (this.#trie.vertices[vertex_ind].is_terminal) {
        this.#patterns_pos[this.#trie.vertices[vertex_ind].pattern_number].push(
          [curr_pos + 1 - this.#patterns[this.#trie.vertices[vertex_ind].pattern_number].length,
           curr_pos + 1
          ]
        );
        alert("We've just found pattern: " + this.#patterns[this.#trie.vertices[vertex_ind].pattern_number] +
          "\nIts starting position is: " + (curr_pos + 2 - this.#patterns[this.#trie.vertices[vertex_ind].pattern_number].length));
        this.pushEventToLog("Pattern " + this.#patterns[this.#trie.vertices[vertex_ind].pattern_number] + " was found");
        await sleep(0.75 * ms_in_s);
      }
      vertex_ind = await this.getTerminalLink(vertex_ind);
    }
  }

  async findAll() {
    // layout
    let add_button = document.getElementById("add_button");
    add_button.disabled = true;
    let run_button = document.getElementById("run_button");
    run_button.disabled = true;
    this.#trie.trie_layout.fixNodes();
    //

    // logic + layout
    let input = document.getElementById("text_field");
    let text = input.value;
    input.value = "";
    let output = document.getElementsByClassName("text_box")[0];

    output.textContent = "";

    let highlighted_passed_area = document.createElement("span");
    highlighted_passed_area.setAttribute("class", "highlighted_field_passed");

    let highlighted_curr_area = document.createElement("span");
    highlighted_curr_area.setAttribute("class", "highlighted_field_curr");

    output.innerHTML = text;
    this.pushEventToLog("The algorithm starts execution");
    await sleep(0.75 * ms_in_s);
    //
    let vertex_ind = 0;
    for (let it = 0; it < text.length; ++it) {
      // layout
      highlighted_curr_area.textContent = text[it];
      output.innerHTML = highlighted_passed_area.outerHTML;
      output.innerHTML += highlighted_curr_area.outerHTML;
      for (let curr_it = it + 1; curr_it < text.length; ++curr_it) {
        output.innerHTML += text[curr_it];
      }
      //

      vertex_ind = await this.jumpTo(vertex_ind, text[it]);
      await this.searchByTermLinks(vertex_ind, it);

      // layout
      highlighted_passed_area.textContent += text[it];
      //

      await sleep(1 * ms_in_s);
    }
    // layout
    output.innerHTML = highlighted_passed_area.outerHTML;
    await sleep(1 * ms_in_s);
    alert("The algorithm finished its execution.\nLet's highlight the matches now.");
    await sleep(1 * ms_in_s);
    this.pushEventToLog("The algorithm ends execution");
    await sleep(0.75 * ms_in_s);
    this.pushEventToLog("Highlighting the matches");
    await sleep(0.75 * ms_in_s);
    output.innerHTML = text;

    output.innerHTML = "";
    let pattern_number = 0;
    let pattern_table_objects = document.getElementsByClassName("info_pattern_cell");

    for (let pattern_matches of this.#patterns_pos) {
      let curr_color = pattern_table_objects[pattern_number].children[1].style.backgroundColor;

      for (let pos of pattern_matches) {
        for (let it = 0; it < pos[0]; ++it) {
          output.innerHTML += text[it];
        }

        let highlighted_ans_area = document.createElement("span");

        for (let it = pos[0]; it < pos[1]; ++it) {
          highlighted_ans_area.textContent += text[it];
        }

        let style_text = "background: linear-gradient(90deg, " + curr_color +" 50%, rgba(255, 255, 255, 0) 50%);";
        style_text += "background-size: 200% 100%;" +
          "background-position: 100% 0;" +
          "user-select: none;" +
          "animation: 2s highlight normal forwards;" +
          "animation-delay: " + String(1) + 's;';

        highlighted_ans_area.setAttribute("style", style_text);

        output.innerHTML += highlighted_ans_area.outerHTML;

        for (let it = pos[1]; it < text.length; ++it) {
          output.innerHTML += text[it];
        }

        await sleep(4.5 * ms_in_s);
        output.innerHTML = "";
      }
      ++pattern_number;
    }
    output.innerHTML = text;
    await sleep(1 * ms_in_s);
    alert("All of the matches were highlighted.\nNow you can execute the algorithm using another example.\nTo restart press the stop button.");
    await sleep(1 * ms_in_s);
    this.pushEventToLog("All of the matches were highlighted");
    //
  }

  pushEventToLog(msg) {
    let log_event = document.createElement("div");
    log_event.setAttribute("class", "info_log_cell");
    log_event.textContent = msg;

    let log = document.getElementsByClassName("log")[0];
    log.appendChild(log_event);
    log.scroll({ top: -log.scrollHeight, behavior: "smooth" });
  }

  get trie() {
    return this.#trie;
  }

  #trie;
  #patterns;
  #patterns_pos;
}

let is_execution_blocked = false;
const ms_in_s = 1000;
const node_radius = 11;
const start_time = Date.now();

function blockExec() {
  is_execution_blocked = true;
}

function unblockExec() {
  is_execution_blocked = false;
}

function getTargetNodeCircumferencePoint(d, scale_k) {
  let dx = d.target.x - d.source.x;
  let dy = d.target.y - d.source.y;
  let angle = Math.atan2(dy, dx);
  let corr_x = d.target.x * scale_k - (node_radius * Math.cos(angle));
  let corr_y = d.target.y * scale_k - (node_radius * Math.sin(angle));
  return [corr_x, corr_y];
}

function getSourceNodeCircumferencePoint(d, scale_k) {
  let dx = d.target.x - d.source.x;
  let dy = d.target.y - d.source.y;
  let angle = Math.atan2(dy, dx);
  let corr_x = d.source.x * scale_k + (node_radius * Math.cos(angle));
  let corr_y = d.source.y * scale_k + (node_radius * Math.sin(angle));
  return [corr_x, corr_y];
}

function drawCurvedPath(link, scale_k, move_x, move_y, height, is_reg=true) {
  let source_x = scale_k * height - getSourceNodeCircumferencePoint(link, scale_k)[1] + move_x;
  let source_y = getSourceNodeCircumferencePoint(link, scale_k)[0] + move_y;
  let target_x = scale_k * height - getTargetNodeCircumferencePoint(link, scale_k)[1] + move_x;
  let target_y = getTargetNodeCircumferencePoint(link, scale_k)[0] + move_y;
  if (is_reg) {
    return ["M", source_x, source_y,
      "L", target_x, target_y].join(" ");
  } else {
    let x_param = 0.75;
    let mid_x = source_x * x_param + target_x * (1 - x_param);
    let min_y_by_abs_val;
    if (Math.abs(target_y) <= Math.abs(source_y)) {
      min_y_by_abs_val = target_y;
    } else {
      min_y_by_abs_val = source_y;
    }
    const mid_y_shift = 60;
    let curve_extension_coef = ((-1) ** (link.direction + 1)) * (link.target.sp_links_curve_abs_val - link.source.sp_links_curve_abs_val);
    if (curve_extension_coef === 0) {
      return ["M", source_x, source_y,
        "L", target_x, target_y].join(" ");
    } else {
      return ["M", source_x, source_y,
        "Q", mid_x, min_y_by_abs_val + curve_extension_coef * mid_y_shift,
        target_x, target_y].join(" ");
    }
  }
}

class TrieLayout {
  constructor(width, height) {

    this.width = width;
    this.height = height;

    const markerBoxWidth = 8;
    const markerBoxHeight = 10;
    const refX = markerBoxWidth * 0.9;
    const refY = markerBoxHeight / 2;
    const arrowPoints = [[0, 0], [8, 5], [0, 10]];

    this.svg = d3.select("#trie")
      .attr("width", width)
      .attr("height", height)
      .attr("transform", "translate(" + String(this.graph_shift[0]) + "," + String(this.graph_shift[1]) + ")")

    let types = ['r', 's', 't'];

    let defs = this.svg.append('defs');

    for (let type of types) {
      defs
        .append('marker')
        .attr('id', "arrowhead_" + type)
        .attr('viewBox', [0, 0, markerBoxWidth, markerBoxHeight])
        .attr('refX', refX)
        .attr('refY', refY)
        .attr('markerWidth', markerBoxWidth)
        .attr('markerHeight', markerBoxHeight)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', d3.line()(arrowPoints))
        .attr('fill', 'none')
        .attr('stroke', function() {
          if (type === 't') {
            return 'rgba(0, 40, 241, 0.78)';
          } else if (type === 's') {
            return 'rgba(253, 149, 18, 0.78)';
          } else {
            return 'rgba(50, 50, 50, 0.2)';
          }
        });
      }

    this.svg
      .style("pointer-events", "all")
      .call(
        d3.zoom()
          .extent([[0, 0], [this.width, this.height]])
          .on("zoom", (event, d) => this.transform(event))
          .on("end", (d) => this.transformEnd())
      );

    let root =
    {
      number: 0,
      label: "",
      parent: null,
      is_highlighted: true,
      is_terminal: false,
      sp_links_curve_abs_val: 0
    };

    this.max_node = 1;
    this.max_link = 0;
    this.max_sp_link = 0;

    root.fx = 15;
    root.fy = height;

    this.nodes = [root];
    this.all_links = [];
    this.reg_links = [];
    this.special_links = [];

    this.resetPointer();
  }

  addNode(node_elem, to_node_ind) {
    let nodes = this.nodes;
    let node =
      { number: this.max_node,
        label: node_elem,
        parent: this.nodes[to_node_ind].number,
        is_highlighted: false,
        is_terminal: false,
        sp_links_curve_abs_val: Math.abs(nodes[to_node_ind].sp_links_curve_abs_val) + 1
      };
    this.nodes.push(node);
    let link = {source: this.nodes[to_node_ind], target: node, is_highlighted: false, is_regular: true, number: this.max_link};
    this.reg_links.push(link);
    this.all_links.push(link);
    this.nodes_to_adjacent_links.set(String(to_node_ind) + '_' + String(this.max_node), this.max_link);
    ++this.max_node;
    ++this.max_link;
  }

  addLink(from_node_ind, to_node_ind, type = 'r') {
    let link;
    if (type === 'r') {
      link = {source: this.nodes[from_node_ind], target: this.nodes[to_node_ind],
              is_highlighted: false, is_regular: true, number: this.max_link}
      this.reg_links.push(link);
    } else {
      link = {source: this.nodes[from_node_ind], target: this.nodes[to_node_ind],
              type: type, direction: this.max_sp_link % 2, is_highlighted: false, is_regular: false,
              number: this.max_link}
      this.special_links.push(link);
      ++this.max_sp_link;
    }
    this.all_links.push(link);
    this.nodes_to_adjacent_links.set(String(from_node_ind) + '_' + String(to_node_ind), this.max_link);
    ++this.max_link;
  }

  removeLastLink() {
    let link = this.all_links.pop();
    if (link.type === 'r') {
      this.reg_links.pop();
    } else {
      this.special_links.pop();
      --this.max_sp_link;
    }
    this.nodes_to_adjacent_links.delete(String(link.source.number) + '_' + String(link.target.number));
    --this.max_link;
  }

  isLinkConnectingNodes(from_node_ind, to_node_ind) {
    return this.nodes_to_adjacent_links.has(String(from_node_ind) + '_' + String(to_node_ind));
  }

  isNodeHighlighted(node_ind) {
    return this.nodes[node_ind].is_highlighted;
  }

  highlightNode(node_ind) {
    this.nodes[node_ind].is_highlighted = true;
  }

  unhighlightNode(node_ind) {
    this.nodes[node_ind].is_highlighted = false;
  }

  makeNodeTerminal(node_ind) {
    this.nodes[node_ind].is_terminal = true;
  }

  setTypeOfLink(from_node_ind, to_node_ind, type) {
    let link_ind = this.nodes_to_adjacent_links.get(String(from_node_ind) + '_' + String(to_node_ind));
    this.all_links[link_ind].type = type;
  }

  highlightLink(from_node_ind, to_node_ind) {
    let link_ind = this.nodes_to_adjacent_links.get(String(from_node_ind) + '_' + String(to_node_ind));
    this.all_links[link_ind].is_highlighted = true;
  }

  unhighlightLink(from_node_ind, to_node_ind) {
    let link_ind = this.nodes_to_adjacent_links.get(String(from_node_ind) + '_' + String(to_node_ind));
    this.all_links[link_ind].is_highlighted = false;
  }

  activatePointer() {
    this.pointer_info.is_active = true;
  }

  deactivatePointer() {
    this.pointer_info.is_active = false;
  }

  setPointerSymbol(curr_symbol) {
    this.pointer_info.symbol = curr_symbol;
  }

  setPointerPath(from_node_ind, to_node_ind) {
    this.pointer_info.from = from_node_ind;
    this.pointer_info.to = to_node_ind;
  }

  setPointerType(type) {
    this.pointer_info.type = type;
  }

  initPointer() {
    if (this.pointer_info.is_active) {
      this.pointer = this.svg
        .append('g')
        .attr("class", "pointer");
      if (this.pointer_info.type === "n") {
        this.pointer
          .append('circle')
          .attr('r', node_radius)
          .attr("class", "highlighted_node");
        this.pointer
          .append('text')
          .attr("font", "160px sans-serif")
          .attr("text-anchor", "middle")
          .attr('transform', 'translate(' + 0 + ',' + 5 + ')')
          .text(this.pointer_info.symbol);
      }
    }
  }

  resetPointer() {
    this.pointer_info = {
      is_active: false,
      symbol: "",
      from: null,
      to: null,
      type: null
    }
  }

  movePointerByLink() {
    if (this.pointer_info.is_active) {
      let scale_k = this.transform_params[0] * this.init_transform_params[0];
      let move_x = this.transform_params[1] + this.init_transform_params[1];
      let move_y = this.transform_params[2] + this.init_transform_params[2];

      let link_ind = this.nodes_to_adjacent_links.get(String(this.pointer_info.from) + '_' + String(this.pointer_info.to));

      this.pointer
        .append('animateMotion')
        .attr('path', drawCurvedPath(this.all_links[link_ind], scale_k, move_x, move_y, this.height, this.all_links[link_ind].is_regular))
        .attr('rotate', '0')
        .attr('begin', String(Date.now() - start_time) + 'ms')
        .attr('dur', '2s')
        .attr('repeatCount', '1')
        .attr('fill', 'freeze');
    }
  }

  stop() {
    this.simulation.stop();
    d3.selectAll('g').remove();
  }

  transform(event) {
    this.stop();

    this.is_transformed = true;

    this.transform_params[0] = event.transform.k;
    this.transform_params[1] = event.transform.x;
    this.transform_params[2] = event.transform.y;
    this.show();
    this.transform_params[0] = event.transform.k;
  }

  transformEnd() {
    this.stop();
    this.is_transformed = false;
    this.show();
  }

  show() {
    let scale_k = this.transform_params[0] * this.init_transform_params[0];
    let move_x = this.transform_params[1] + this.init_transform_params[1];
    let move_y = this.transform_params[2] + this.init_transform_params[2];

    let nodeElements = this.svg.append('g')
      .selectAll('circle')
      .data(this.nodes)
      .enter().append('circle')
      .attr('r', node_radius)
      .attr("class", function(d) {
        if (d.is_highlighted) {
          return "highlighted_node";
      } else if (d.is_terminal) {
          return "terminal_node";
      } else {
          return "reg_node";
        }
      });

    let linkElements = this.svg.append('g')
      .attr("class", "links")
      .selectAll("path")
      .data(this.reg_links)
      .enter().append("path")
      .attr("class", function(d) {
        if (d.is_highlighted) {
          return "highlighted_link_path";
        } else {
          return "reg_link";
        }
      });

    let specialLinkElements = this.svg.append('g')
      .attr("class", "special_links")
      .selectAll("path")
      .data(this.special_links)
      .enter().append("path")
      .attr("class", function(d) {
        if (d.is_highlighted) {
          if (d.type === 's') {
            return "highlighted_suffix_link_path";
          } else if (d.type === 't') {
            return "highlighted_terminal_link_path";
          } else {
            return "highlighted_link_path";
          }
        } else {
          if (d.type === 's') {
            return "suffix_link";
          } else if (d.type === 't') {
            return "terminal_link";
          }
        }
      });

    let linksText = this.svg.append("g")
      .attr("class", "links_text")
      .selectAll("text")
      .data(this.reg_links)
      .enter().append("text")
      .attr("font", "160px sans-serif")
      .attr("text-anchor", "middle")
      .attr("class", "graph_text")
      .text(function(d) { return d.target.label });

    let highlightedLink = document.querySelectorAll(".highlighted_link_path, .highlighted_suffix_link_path, .highlighted_terminal_link_path");

    highlightedLink.forEach(link => link.addEventListener('animationend', function() {
      unblockExec();
    }));

    if (this.is_transformed) {
      highlightedLink.forEach(function(link) {
        link.style["display"] = "none";
      })
    } else {
      this.initPointer();
    }

    this.simulation = d3.forceSimulation(this.nodes, this.reg_links).alpha(1)
      .force("link", d3.forceLink(this.reg_links).id(d => d.id).distance(100).strength(0.7))
      .force("charge", d3.forceManyBody().strength(-4500))
      .force("y", d3.forceY().strength(0.4))
      .force("x1", d3.forceX().strength(1))
      .force("collision", d3.forceCollide().radius(d => d.r * 10).strength(10));

    const linkTextOffset = 5;
    let height = this.height;
    let pointer_type = this.pointer_info.type;
    this.simulation.nodes(this.nodes, this.reg_links).on("tick", () => {
      nodeElements
        .attr("cx", node => scale_k * (height - node.y))
        .attr("cy", node => scale_k * node.x)
        .attr("transform", "translate(" + String(move_x) + "," + String(move_y) + ")")
      linkElements
        .attr("d", link => drawCurvedPath(link, scale_k, move_x, move_y, height))
      specialLinkElements
        .attr("d", link => drawCurvedPath(link, scale_k, move_x, move_y, height, false))
      linksText
        .attr("x", function (link) { return scale_k * (height - link.target.y)})
        .attr("y", function (link) { return linkTextOffset + scale_k * link.target.x})
        .attr("transform", "translate(" + String(move_x) + "," + String(move_y) + ")")
      highlightedLink.forEach(function(link) {
        link.style["stroke-dasharray"] = String(link.getTotalLength());
        if (pointer_type === "n") {
          link.style["stroke-dashoffset"] = String(link.getTotalLength() - node_radius);
        } else {
          link.style["stroke-dashoffset"] = String(link.getTotalLength());
        }
      })
    });

    this.simulation.force('link').links(this.reg_links);

    this.movePointerByLink();
  }

  fixNodes() {
    this.nodes.forEach((d) => {
      d.fx = d.x;
      d.fy = d.y;
    })
  }

  height;
  width;
  max_node;
  max_link;
  max_sp_link;
  svg;
  nodes;
  reg_links;
  special_links;
  all_links;
  simulation;
  graph_shift = [100, 30];
  init_transform_params = [0.7, 150, 150];
  transform_params = [1.0, 0.0, 0.0];
  is_transformed;
  nodes_to_adjacent_links = new Map();
  pointer;
  pointer_info;
}

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

let aho_corasick = new AhoCorasickWrapper();
