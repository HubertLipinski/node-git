<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a id="readme-top"></a>


<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]



<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/HubertLipinski/node-git">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">node-git</h3>

  <p align="center">
    Node.js implementation of Git filesystem versioning
    <br />
    <br />

[//]: # (    <a href="https://github.com/HubertLipinski/node-git">View Demo</a>)
[//]: # (    ·)
[//]: # (    <a href="https://github.com/HubertLipinski/node-git/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>)
[//]: # (    ·)
[//]: # (    <a href="https://github.com/HubertLipinski/node-git/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>)
  </p>
</div>



<!-- TABLE OF CONTENTS -->

[//]: # (<details open>)
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#differences-with-git">Differences With Git</a></li>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

[![Product Name Screen Shot][product-screenshot]](https://example.com)

My motivation for creating node-git was to understand the ins and outs of Git.
Since Node.js is fairly limited in terms of memory management compared to C, this project implements only necessary functionalities of Git such as ``add``, ``commit``, ``checkout``, ``status``, ``log``, and many more commands used to manage file versions and internals objects.

All commands were modeled after the original Git commands in terms of their behavior, parameters and names. Not all of them have their full original options support due to the fact that Git is a very powerful tool, and mapping it completely in Node,js goes beyond the scope of my original premise of keeping this project simple.

Object files are stored in ``.node-git`` folder in your repository (after initialization).
``node-git`` is compatible with git's files such as ``.gitignore`` and uses git's ``config`` files, so you don't need to configure it if You are already using Git.

### Differences With Git
Some of git's internal logic has been omitted due to lack of need or due to the sophistication of the functionality in question. In the future, the following list may change, and the given differences may be introduced to node-git
* We do not use 32-bit ctime/mtime nanosecond fractions in INDEX file, only the 32-bit seconds
* node-git only supports v2 INDEX file. 

You can read more about INDEX file [here](https://github.com/git/git/blob/master/Documentation/gitformat-index.txt)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

[![Next][Node-logo]][Node-url]  
[![Typescript][TS-logo]][TS-url]
<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

Requires Node v20+

### Installation

  ```sh
  npm install node-git -g
  ```
<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- USAGE EXAMPLES -->
## Usage

Use this space to show useful examples of how a project can be used. Additional screenshots, code examples and demos work well in this space. You may also link to more resources.

_For more examples, please refer to the [Documentation](https://example.com)_

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->
## Roadmap

The following functionalities are currently under development

- [ ] Additional commands
  - [ ] rm
  - [ ] tag
  - [ ] config
  - [ ] diff
- [ ] Remote repository support
    - [ ] Remote command
    - [ ] Clone
    - [ ] Push
    - [ ] Pull

See the [open issues](https://github.com/HubertLipinski/node-git/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Hubert Lipiński - hubertlipinskipl@gmail.com

Project Link: [https://github.com/HubertLipinski/node-git](https://github.com/HubertLipinski/node-git)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

* [Git repository](https://github.com/git/git/)
* [Git for Professionals - Scott Chacon and Ben Straub](https://git-scm.com/book/en/v2)
* [WYAG](https://wyag.thb.lt/#intro)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/HubertLipinski/node-git.svg?style=for-the-badge
[contributors-url]: https://github.com/HubertLipinski/node-git/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/HubertLipinski/node-git.svg?style=for-the-badge
[forks-url]: https://github.com/HubertLipinski/node-git/network/members
[stars-shield]: https://img.shields.io/github/stars/HubertLipinski/node-git.svg?style=for-the-badge
[stars-url]: https://github.com/HubertLipinski/node-git/stargazers
[issues-shield]: https://img.shields.io/github/issues/HubertLipinski/node-git.svg?style=for-the-badge
[issues-url]: https://github.com/HubertLipinski/node-git/issues
[license-shield]: https://img.shields.io/github/license/HubertLipinski/node-git.svg?style=for-the-badge
[license-url]: https://github.com/HubertLipinski/node-git/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/hubert-lipinski/
[product-screenshot]: images/screenshot.png
[Node-logo]: https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white
[Node-url]: https://nodejs.org/en
[TS-logo]: https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
[TS-url]: https://www.typescriptlang.org/