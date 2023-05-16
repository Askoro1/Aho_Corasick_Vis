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

  async addNewString(str, str_number) {
    let ind = 0;
    for (let char of str) {
      if (!this.#vertices[ind].next_vertices.has(char)) {
        this.#vertices.push(new Vertex(ind, char));
        this.#vertices[ind].next_vertices.set(char, this.#vertices.length - 1);
        // layout
        this.#trie_layout.addNode(char, ind);
        this.#trie_layout.unhighlightNode(ind);
        this.#trie_layout.highlightNode(this.#vertices.length - 1);
        // this.#trie_layout.adjustSize();
        this.#trie_layout.show();

        let input = document.getElementById('highlighted_pattern_field');
        ++pattern_input_highlighted_dist[1];
        input.focus();
        input.setSelectionRange(pattern_input_highlighted_dist[0], pattern_input_highlighted_dist[1]);
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
      await sleep(1.5 * ms);
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

  #vertices;
  #trie_layout;
}

class AhoCorasickWrapper {
  constructor() {
    this.#trie = new Trie();
    this.#patterns = [];
  }

  async addNewPattern() {
    // layout
    let input = document.getElementById('pattern_field');
    let pattern = input.value;
    input.setAttribute("id", "highlighted_pattern_field");
    input.setAttribute("readonly", "true");

    input.focus();

    let on_select_unchanged = function(event) {
      input.setSelectionRange(pattern_input_highlighted_dist[0], pattern_input_highlighted_dist[1]);
    };

    input.addEventListener("select", on_select_unchanged);
    //
    // logic + layout
    await this.#trie.addNewString(pattern, this.#patterns.length);
    this.#patterns.push(pattern);
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
      alpha: 0.5
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

  getSuffixLink(vertex_ind) {
    if (this.#trie.vertices[vertex_ind].suffix_link === -1) {
      if (vertex_ind === 0 ||
          this.#trie.vertices[vertex_ind].parent === 0) {
        this.#trie.vertices[vertex_ind].suffix_link = 0;
      } else {
        this.#trie.vertices[vertex_ind].suffix_link = this.jumpTo(this.getSuffixLink(
                                                                  this.#trie.vertices[vertex_ind].parent),
                                                                  this.#trie.vertices[vertex_ind].edge_symbol);
      }
    }
    return this.#trie.vertices[vertex_ind].suffix_link;
  }

  jumpTo(vertex_ind, char) {
    if (!this.#trie.vertices[vertex_ind].automaton_jumps.has(char)) {
      if (this.#trie.vertices[vertex_ind].next_vertices.has(char)) {
        this.#trie.vertices[vertex_ind].automaton_jumps.set(char, this.#trie.vertices[vertex_ind].next_vertices.get(char));
      } else {
        if (vertex_ind === 0) {
          this.#trie.vertices[vertex_ind].automaton_jumps.set(char, 0);
        } else {
          this.#trie.vertices[vertex_ind].automaton_jumps.set(char,
                                                              this.jumpTo(this.getSuffixLink(vertex_ind), char));
        }
      }
    }
    return this.#trie.vertices[vertex_ind].automaton_jumps.get(char);
  }

  getTerminalLink(vertex_ind) {
    if (this.#trie.vertices[vertex_ind].suffix_term_link === -1) {
      let curr_suf_link = this.getSuffixLink(vertex_ind);
      if (curr_suf_link === 0) {
        this.#trie.vertices[vertex_ind].suffix_term_link = 0;
      } else {
        if (this.#trie.vertices[curr_suf_link].is_terminal) {
          this.#trie.vertices[vertex_ind].suffix_term_link = curr_suf_link;
        } else {
          this.#trie.vertices[vertex_ind].suffix_term_link = this.getTerminalLink(curr_suf_link);
        }
      }
    }
    return this.#trie.vertices[vertex_ind].suffix_term_link;
  }

  searchByTermLinks(vertex_ind, curr_pos) {
    while (vertex_ind > 0) {
      if (this.#trie.vertices[vertex_ind].is_terminal) {
        alert("Pattern: " + this.#patterns[this.#trie.vertices[vertex_ind].pattern_number] +
              "\nStart: " + (curr_pos + 1 - this.#patterns[this.#trie.vertices[vertex_ind].pattern_number].length));
      }
      vertex_ind = this.getTerminalLink(vertex_ind);
    }
  }

  findAll(text) {
    let vertex_ind = 0;
    for (let it = 0; it < text.length; ++it) {
      vertex_ind = this.jumpTo(vertex_ind, text[it]);
      this.searchByTermLinks(vertex_ind, it);
    }
  }

  #trie;
  #patterns;
}

const ms = 1000;
let pattern_input_highlighted_dist = [0, 0];
const node_radius = 11;

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

    this.svg
      .append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', [0, 0, markerBoxWidth, markerBoxHeight])
      .attr('refX', refX)
      .attr('refY', refY)
      .attr('markerWidth', markerBoxWidth)
      .attr('markerHeight', markerBoxHeight)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', d3.line()(arrowPoints))
      .attr('fill', 'none')
      .attr('stroke', 'rgba(50, 50, 50, 0.2)');

    this.svg
      .style("pointer-events", "all")
      .call(
        d3.zoom()
          .extent([[0, 0], [this.width, this.height]])
          .on("zoom", (event, d) => this.transform(event))
      );

    let root =
    {
      name: "Node0",
      label: "NULL",
      parent: null,
      is_highlighted: true,
      is_terminal: false
    };

    this.max_node = 1;

    root.fx = 15;
    root.fy = height;

    this.nodes = [root];
    this.links = [];
  }

  addNode(node_elem, to_node_ind) {
    this.stop();
    let node =
      {name: "Node" + String(this.max_node),
       label: node_elem,
       parent: this.nodes[to_node_ind].name,
       is_highlighted: false,
        is_terminal: false
      }
    ++this.max_node;
    this.nodes.push(node);
    this.links.push({source: this.nodes[to_node_ind], target: node});
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

  stop() {
    this.simulation.stop();
    d3.selectAll('g').remove();
  }

  transform(event) {
    this.stop();
    this.transform_params[0] = event.transform.k;
    this.transform_params[1] = event.transform.x;
    this.transform_params[2] = event.transform.y;
    this.show()
    this.transform_params[0] = event.transform.k;
  }

  // adjustSize() {
  //   this.stop();
  //
  //   const margin = 15;
  //   let min_x = d3.min(this.nodes, d => this.height - d.y) - node_radius / 2;
  //   let max_x = d3.max(this.nodes, d => this.height - d.y) + node_radius / 2;
  //   let min_y = d3.min(this.nodes, d => d.x) - node_radius / 2;
  //   let max_y = d3.max(this.nodes, d => d.x) + node_radius / 2;
  //
  //   console.log(min_x, max_x, min_y, max_y);
  //
  //   let len_x = max_x - min_x;
  //   let len_y = max_y - min_y;
  //
  //   console.log((this.width) / len_x);
  //   console.log((this.height) / len_y)
  //
  //   this.transform_params[0] = Math.min((this.width - margin) / (len_x - margin), (this.height - margin) / (len_y - margin));
  //
  //   console.log("scale_k:", this.transform_params[0]);
  // }

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
        }});

    let linkElements = this.svg.append('g')
      .attr("class", "links")
      .selectAll("line")
      .data(this.links)
      .enter().append("line")
      .attr("class", "arrow_link")

    let linksText = this.svg.append("g")
      .attr("class", "links_text")
      .selectAll("text")
      .data(this.links)
      .enter().append("text")
      .attr("font", "160px sans-serif")
      .attr("text-anchor", "middle")
      .attr("class", "graph_text")
      .text(function(d) { return d.target.label });

    this.simulation = d3.forceSimulation(this.nodes, this.links)
      .force("link", d3.forceLink(this.links).id(d => d.id).distance(100).strength(1.2))
      .force("charge", d3.forceManyBody().strength(-5000))
      .force("y", d3.forceY().strength(0.4))
      .force("x1", d3.forceX().strength(1))
      //.force("x2", d3.forceX().strength(0.1))
      .force("collision", d3.forceCollide().radius(d => d.r * 10).strength(10).iterations(10));

    const linkTextOffset = 5;
    let height = this.height;
    this.simulation.nodes(this.nodes, this.links).on("tick", () => {
      nodeElements
        .attr("cx", node => scale_k * (height - node.y))
        .attr("cy", node => scale_k * node.x)
        .attr("transform", "translate(" + String(move_x) + "," + String(move_y) + ")")
      linkElements
        .attr('x1', function (link) { return scale_k * height - getSourceNodeCircumferencePoint(link, scale_k)[1] + move_x})
        .attr('y1', function (link) { return getSourceNodeCircumferencePoint(link, scale_k)[0] + move_y})
        .attr('x2', function (link) { return scale_k * height - getTargetNodeCircumferencePoint(link, scale_k)[1] + move_x})
        .attr('y2', function (link) { return getTargetNodeCircumferencePoint(link, scale_k)[0] + move_y})
      linksText
        .attr('x', function (link) { return scale_k * (height - link.target.y)})
        .attr('y', function (link) { return linkTextOffset + scale_k * link.target.x})
        .attr("transform", "translate(" + String(move_x) + "," + String(move_y) + ")")
    });

    this.simulation.force('link').links(this.links);
  }

  height;
  width;
  max_node;
  svg;
  nodes;
  links;
  simulation;
  graph_shift = [100, 30];

  init_transform_params = [0.7, 150, 150];
  transform_params = [1.0, 0.0, 0.0];
}

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

let aho_corasick = new AhoCorasickWrapper();


/*let aho_corasick = new AhoCorasickWrapper();
let text = prompt("Write the text you want to search by:");
let n = prompt("Write the number of patterns you are looking for:");
for (let it = 0; it < n; ++it) {
  let pattern = prompt("Write the pattern you are searching for:");
  aho_corasick.addNewPattern(pattern);
}
let start_search = confirm("Start the search?");
if (start_search) {
  aho_corasick.findAll(text);
}*/
