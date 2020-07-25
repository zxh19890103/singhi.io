---
layout: post
title: Mac/Linux系统Terminal中不同文件类型的颜色
short: Mac/Linux系统Terminal中不同文件类型的颜色
---

<div class="content__body article">
<table style="border-collapse: collapse; width: 100%;" border="1">
<tbody>
<tr style="height: 18px;">
<td style="height: 18px; background: initial; color: blue;">ex</td>
<td style="height: 18px; background: initial; color: magenta;">fx</td>
<td style="height: 18px; background: initial; color: green;">cx</td>
</tr>
<tr>
<td style="height: 54px;">directory</td>
<td style="height: 54px;">symbolic link</td>
<td style="height: 54px;">socket</td>
</tr>
<tr>
<td style="height: 18px; background: initial; color: brown;">dx</td>
<td style="height: 18px; background: initial; color: red;">bx</td>
<td>&nbsp;</td>
</tr>
<tr style="height: 54px;">
<td style="height: 54px;">pipe</td>
<td style="height: 54px;">executable</td>
<td>&nbsp;</td>
</tr>
<tr>
<td style="height: 18px; background: cyan; color: blue;">eg</td>
<td style="height: 18px; background: brown; color: #blue;">ed</td>
<td style="height: 18px; background: red; color: black;">ab</td>
</tr>
<tr>
<td style="height: 54px;">block special</td>
<td style="height: 54px;">character special</td>
<td style="height: 54px;">executable with setuid bit set</td>
</tr>
<tr>
<td style="background: cyan; color: black; height: 18px;">ag</td>
<td style="background: green; color: black; height: 18px;">ac</td>
<td style="background: brown; color: black; height: 18px;">ad</td>
</tr>
<tr>
<td style="height: 54px;">executable without setuid / black / cyan</td>
<td style="height: 54px;">directory with sticky / black / green</td>
<td style="height: 54px;">directory without sticky / black / brown</td>
</tr>
</tbody>
</table>
<p>Now, let’s learn how we can configure our Terminal to obtain the colors of the figure.</p>

{% include img.html src="http://zxh1989.oss-cn-qingdao.aliyuncs.com/20190317/003128_64420.png" title="Terminal custom colors" %}

<p>Colors can be changed using the&nbsp;<span style="color: #b45f06;">LSCOLORS</span>variable in the&nbsp;<span style="color: #a64d79;">~/.zsh_profile</span>. By default is set to</p>
<p><span style="color: #b45f06;">LSCOLORS=exfxcxdxbxegedabagacad</span></p>
<p>where the string&nbsp;<span style="color: #b45f06;">exfxcxdxbxegedabagacad</span>&nbsp;is a concatenation of pairs of the format TB, where T is the text color and B is the Background color.</p>
<p>The order of these pairs correspond to:</p>
<ol>
<li><span style="color: #a64d79;">directory</span></li>
<li><span style="color: #a64d79;">symbolic link</span>&nbsp;– special kind of file that contains a reference to another file or directory.</li>
<li><span style="color: #a64d79;">socket</span>&nbsp;– special kind of file used for inter-process communication.</li>
<li><span style="color: #a64d79;">pipe</span>&nbsp;– special file that connects the output of one process to the input of another.</li>
<li><span style="color: #a64d79;">executable</span></li>
<li><span style="color: #a64d79;">block special</span>&nbsp;– a kind of device file.</li>
<li><span style="color: #a64d79;">character special</span>&nbsp;– a kind of device file.</li>
<li><span style="color: #a64d79;">executable with setuid bit set</span>&nbsp;(setuid is a short for set user ID upon execution).</li>
<li><span style="color: #a64d79;">executable with setgid bit set</span>&nbsp;(setgid is a short for set group ID upon execution).</li>
<li><span style="color: #a64d79;">directory writable to others, with sticky bit</span>&nbsp;– only the owner can rename or delete files.</li>
<li><span style="color: #a64d79;">directory writable to others, without sticky bit</span>&nbsp;– any user with write and execution permissions can rename or delete files.</li>
</ol>
<p>And the different letters correspond to:</p>
<ul>
<li><span style="color: #a64d79;">a</span>&nbsp;black</li>
<li><span style="color: #a64d79;">b</span>&nbsp;red</li>
<li><span style="color: #a64d79;">c</span>&nbsp;green</li>
<li><span style="color: #a64d79;">d&nbsp;</span>brown</li>
<li><span style="color: #a64d79;">e&nbsp;</span>blue</li>
<li><span style="color: #a64d79;">f</span>&nbsp;magenta</li>
<li><span style="color: #a64d79;">g</span>&nbsp;cyan</li>
<li><span style="color: #a64d79;">h</span>&nbsp;light grey</li>
<li><span style="color: #a64d79;">x</span>&nbsp;default color</li>
</ul>
<p>The same letters in uppercase indicate&nbsp;<strong>Bold</strong>.</p>
<p>The Terminal default colors, described by&nbsp;<span style="color: #b45f06;">exfxcxdxbxegedabagacad</span>, and ordered by&nbsp;<span style="color: #a64d79;">file type / text color / background color</span>, are:</p>
<ol>
<li>ex –&gt; directory / blue / default</li>
<li>fx –&gt; symbolic link / magenta / default</li>
<li>cx –&gt; socket / green / default</li>
<li>dx –&gt; pipe / brown / default</li>
<li>bx –&gt; executable / red / default</li>
<li>eg –&gt; block special / blue / cyan</li>
<li>ed –&gt; character special / blue / brown</li>
<li>ab&nbsp;–&gt; executable with setuid / black / red</li>
<li>ag&nbsp;–&gt; executable without setuid / black / cyan</li>
<li>ac&nbsp;–&gt; directory with sticky / black / green</li>
<li>ad&nbsp;–&gt; directory without sticky / black / brown</li>
</ol>
<p>You can&nbsp;<strong>change the colors of your terminal</strong>&nbsp;by creating a new concatenated string, like<br><span style="border: 0px; font-family: Verdana, sans-serif; font-style: inherit; font-weight: inherit; margin: 0px; outline: 0px; padding: 0px; vertical-align: baseline; color: #b45f06;">GxFxCxDxBxegedabagaced</span>, and writing in&nbsp;the&nbsp;<span style="color: #a64d79;">.bash_profile</span>&nbsp;file the following line:</p>
<p><span style="color: #b45f06;">export LSCOLORS=GxFxCxDxBxegedabagaced</span></p>
<p>Enjoy the new Terminal layout!</p></div>
