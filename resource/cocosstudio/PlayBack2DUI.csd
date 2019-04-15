<GameFile>
  <PropertyGroup Name="PlayBack2DUI" Type="Layer" ID="ebbe4935-f812-42a3-8256-e1ecba72322e" Version="3.10.0.0" />
  <Content ctype="GameProjectContent">
    <Content>
      <Animation Duration="0" Speed="1.0000" />
      <ObjectData Name="Layer" Tag="183" ctype="GameLayerObjectData">
        <Size X="1280.0000" Y="720.0000" />
        <Children>
          <AbstractNodeData Name="room_info_panel" ActionTag="652340900" Tag="131" IconVisible="False" LeftMargin="614.4743" RightMargin="265.5257" TopMargin="296.9594" BottomMargin="373.0406" ClipAble="False" BackColorAlpha="102" ColorAngle="90.0000" LeftEage="69" RightEage="69" TopEage="10" BottomEage="10" Scale9OriginX="-69" Scale9OriginY="-10" Scale9Width="138" Scale9Height="20" ctype="PanelObjectData">
            <Size X="400.0000" Y="50.0000" />
            <Children>
              <AbstractNodeData Name="label_bg" ActionTag="1065731259" Alpha="204" Tag="119" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="95.0000" RightMargin="95.0000" TopMargin="9.0000" BottomMargin="9.0000" LeftEage="69" RightEage="69" TopEage="10" BottomEage="10" Scale9OriginX="69" Scale9OriginY="10" Scale9Width="72" Scale9Height="12" ctype="ImageViewObjectData">
                <Size X="210.0000" Y="32.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="200.0000" Y="25.0000" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.5000" Y="0.5000" />
                <PreSize X="0.5250" Y="0.6400" />
                <FileData Type="Normal" Path="Default/label_bg.png" Plist="" />
              </AbstractNodeData>
              <AbstractNodeData Name="rate_label" ActionTag="-1078523557" Tag="724" IconVisible="False" LeftMargin="109.4071" RightMargin="164.5929" TopMargin="11.3694" BottomMargin="11.6306" FontSize="24" LabelText="进度：2/191 " VerticalAlignmentType="VT_Center" ShadowOffsetX="2.0000" ShadowOffsetY="-2.0000" ctype="TextObjectData">
                <Size X="126.0000" Y="27.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="172.4071" Y="25.1306" />
                <Scale ScaleX="0.7500" ScaleY="0.7500" />
                <CColor A="255" R="116" G="215" B="205" />
                <PrePosition X="0.4310" Y="0.5026" />
                <PreSize X="0.3150" Y="0.5400" />
                <FontResource Type="Normal" Path="font/zhunyuan.ttf" Plist="" />
                <OutlineColor A="255" R="255" G="0" B="0" />
                <ShadowColor A="255" R="110" G="110" B="110" />
              </AbstractNodeData>
              <AbstractNodeData Name="speed_label" ActionTag="-1481693891" Tag="750" IconVisible="False" LeftMargin="219.2538" RightMargin="110.7462" TopMargin="11.3512" BottomMargin="11.6488" FontSize="24" LabelText=" 4倍速" HorizontalAlignmentType="HT_Right" VerticalAlignmentType="VT_Center" ShadowOffsetX="2.0000" ShadowOffsetY="-2.0000" ctype="TextObjectData">
                <Size X="70.0000" Y="27.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="254.2538" Y="25.1488" />
                <Scale ScaleX="0.7500" ScaleY="0.7500" />
                <CColor A="255" R="249" G="219" B="8" />
                <PrePosition X="0.6356" Y="0.5030" />
                <PreSize X="0.1750" Y="0.5400" />
                <FontResource Type="Normal" Path="font/zhunyuan.ttf" Plist="" />
                <OutlineColor A="255" R="255" G="0" B="0" />
                <ShadowColor A="255" R="110" G="110" B="110" />
              </AbstractNodeData>
            </Children>
            <AnchorPoint />
            <Position X="614.4743" Y="373.0406" />
            <Scale ScaleX="1.0000" ScaleY="1.0000" />
            <CColor A="255" R="255" G="255" B="255" />
            <PrePosition X="0.4801" Y="0.5181" />
            <PreSize X="0.3125" Y="0.0694" />
            <SingleColor A="255" R="150" G="200" B="255" />
            <FirstColor A="255" R="150" G="200" B="255" />
            <EndColor A="255" R="255" G="255" B="255" />
            <ColorVector ScaleY="1.0000" />
          </AbstractNodeData>
          <AbstractNodeData Name="player_operation_panel0" ActionTag="260526146" VisibleForFrame="False" Tag="184" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="360.0000" RightMargin="360.0000" TopMargin="510.7280" BottomMargin="129.2720" TouchEnable="True" ClipAble="False" BackColorAlpha="102" ColorAngle="90.0000" Scale9Width="1" Scale9Height="1" ctype="PanelObjectData">
            <Size X="560.0000" Y="80.0000" />
            <Children>
              <AbstractNodeData Name="chow_chk" ActionTag="-440995626" Tag="65" IconVisible="False" PositionPercentYEnabled="True" LeftMargin="96.0000" RightMargin="412.0000" TopMargin="16.0000" BottomMargin="16.0000" TouchEnable="True" ctype="CheckBoxObjectData">
                <Size X="52.0000" Y="48.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="122.0000" Y="40.0000" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.2179" Y="0.5000" />
                <PreSize X="0.0929" Y="0.6000" />
                <NormalBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/chow_n.png" Plist="PlaybackUI.plist" />
                <PressedBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/chow_s.png" Plist="PlaybackUI.plist" />
                <NodeNormalFileData Type="MarkedSubImage" Path="PlayBack2DUI/chow_s.png" Plist="PlaybackUI.plist" />
              </AbstractNodeData>
              <AbstractNodeData Name="pong_chk" ActionTag="1255922239" Tag="66" IconVisible="False" PositionPercentYEnabled="True" LeftMargin="174.0000" RightMargin="334.0000" TopMargin="16.0000" BottomMargin="16.0000" TouchEnable="True" ctype="CheckBoxObjectData">
                <Size X="52.0000" Y="48.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="200.0000" Y="40.0000" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.3571" Y="0.5000" />
                <PreSize X="0.0929" Y="0.6000" />
                <NormalBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/pong_n.png" Plist="PlaybackUI.plist" />
                <PressedBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/pong_s.png" Plist="PlaybackUI.plist" />
                <NodeNormalFileData Type="MarkedSubImage" Path="PlayBack2DUI/pong_s.png" Plist="PlaybackUI.plist" />
              </AbstractNodeData>
              <AbstractNodeData Name="kong_chk" ActionTag="1407270995" Tag="67" IconVisible="False" PositionPercentYEnabled="True" LeftMargin="252.0000" RightMargin="256.0000" TopMargin="16.0000" BottomMargin="16.0000" TouchEnable="True" ctype="CheckBoxObjectData">
                <Size X="52.0000" Y="48.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="278.0000" Y="40.0000" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.4964" Y="0.5000" />
                <PreSize X="0.0929" Y="0.6000" />
                <NormalBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/kong_n.png" Plist="PlaybackUI.plist" />
                <PressedBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/kong_s.png" Plist="PlaybackUI.plist" />
                <NodeNormalFileData Type="MarkedSubImage" Path="PlayBack2DUI/kong_s.png" Plist="PlaybackUI.plist" />
              </AbstractNodeData>
              <AbstractNodeData Name="win_chk" ActionTag="-2122442184" Tag="68" IconVisible="False" PositionPercentYEnabled="True" LeftMargin="330.0000" RightMargin="178.0000" TopMargin="16.0000" BottomMargin="16.0000" TouchEnable="True" ctype="CheckBoxObjectData">
                <Size X="52.0000" Y="48.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="356.0000" Y="40.0000" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.6357" Y="0.5000" />
                <PreSize X="0.0929" Y="0.6000" />
                <NormalBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/win_n.png" Plist="PlaybackUI.plist" />
                <PressedBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/win_s.png" Plist="PlaybackUI.plist" />
                <NodeNormalFileData Type="MarkedSubImage" Path="PlayBack2DUI/win_s.png" Plist="PlaybackUI.plist" />
              </AbstractNodeData>
              <AbstractNodeData Name="pass_chk" ActionTag="-75092130" Tag="69" IconVisible="False" PositionPercentYEnabled="True" LeftMargin="408.0000" RightMargin="100.0000" TopMargin="16.0000" BottomMargin="16.0000" TouchEnable="True" ctype="CheckBoxObjectData">
                <Size X="52.0000" Y="48.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="434.0000" Y="40.0000" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.7750" Y="0.5000" />
                <PreSize X="0.0929" Y="0.6000" />
                <NormalBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/pass_n.png" Plist="PlaybackUI.plist" />
                <PressedBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/pass_s.png" Plist="PlaybackUI.plist" />
                <NodeNormalFileData Type="MarkedSubImage" Path="PlayBack2DUI/pass_s.png" Plist="PlaybackUI.plist" />
              </AbstractNodeData>
              <AbstractNodeData Name="pass2_chk" ActionTag="1225379988" Tag="84" IconVisible="False" PositionPercentYEnabled="True" LeftMargin="408.0000" RightMargin="100.0000" TopMargin="16.0000" BottomMargin="16.0000" TouchEnable="True" ctype="CheckBoxObjectData">
                <Size X="52.0000" Y="48.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="434.0000" Y="40.0000" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.7750" Y="0.5000" />
                <PreSize X="0.0929" Y="0.6000" />
                <NormalBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/pass2_n.png" Plist="PlaybackUI.plist" />
                <PressedBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/pass2_s.png" Plist="PlaybackUI.plist" />
                <NodeNormalFileData Type="MarkedSubImage" Path="PlayBack2DUI/pass2_s.png" Plist="PlaybackUI.plist" />
              </AbstractNodeData>
            </Children>
            <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
            <Position X="640.0000" Y="169.2720" />
            <Scale ScaleX="1.0000" ScaleY="1.0000" />
            <CColor A="255" R="255" G="255" B="255" />
            <PrePosition X="0.5000" Y="0.2351" />
            <PreSize X="0.4375" Y="0.1111" />
            <SingleColor A="255" R="150" G="200" B="255" />
            <FirstColor A="255" R="150" G="200" B="255" />
            <EndColor A="255" R="255" G="255" B="255" />
            <ColorVector ScaleY="1.0000" />
          </AbstractNodeData>
          <AbstractNodeData Name="player_operation_panel1" ActionTag="-1280614833" VisibleForFrame="False" Tag="1475" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="1030.2240" RightMargin="189.7760" TopMargin="114.0000" BottomMargin="186.0000" TouchEnable="True" ClipAble="False" BackColorAlpha="102" ColorAngle="90.0000" Scale9Width="1" Scale9Height="1" ctype="PanelObjectData">
            <Size X="60.0000" Y="420.0000" />
            <Children>
              <AbstractNodeData Name="chow_chk" ActionTag="693860142" Tag="60" IconVisible="False" PositionPercentXEnabled="True" LeftMargin="4.0000" RightMargin="4.0000" TopMargin="38.9924" BottomMargin="333.0076" TouchEnable="True" ctype="CheckBoxObjectData">
                <Size X="52.0000" Y="48.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="30.0000" Y="357.0076" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.5000" Y="0.8500" />
                <PreSize X="0.8667" Y="0.1143" />
                <NormalBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/chow_n.png" Plist="PlaybackUI.plist" />
                <PressedBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/chow_s.png" Plist="PlaybackUI.plist" />
                <NodeNormalFileData Type="MarkedSubImage" Path="PlayBack2DUI/chow_s.png" Plist="PlaybackUI.plist" />
              </AbstractNodeData>
              <AbstractNodeData Name="pong_chk" ActionTag="-1113676571" Tag="61" IconVisible="False" PositionPercentXEnabled="True" LeftMargin="4.0000" RightMargin="4.0000" TopMargin="116.9926" BottomMargin="255.0074" TouchEnable="True" ctype="CheckBoxObjectData">
                <Size X="52.0000" Y="48.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="30.0000" Y="279.0074" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.5000" Y="0.6643" />
                <PreSize X="0.8667" Y="0.1143" />
                <NormalBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/pong_n.png" Plist="PlaybackUI.plist" />
                <PressedBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/pong_s.png" Plist="PlaybackUI.plist" />
                <NodeNormalFileData Type="MarkedSubImage" Path="PlayBack2DUI/pong_s.png" Plist="PlaybackUI.plist" />
              </AbstractNodeData>
              <AbstractNodeData Name="kong_chk" ActionTag="1746534120" Tag="62" IconVisible="False" PositionPercentXEnabled="True" LeftMargin="4.0000" RightMargin="4.0000" TopMargin="194.9935" BottomMargin="177.0065" TouchEnable="True" ctype="CheckBoxObjectData">
                <Size X="52.0000" Y="48.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="30.0000" Y="201.0065" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.5000" Y="0.4786" />
                <PreSize X="0.8667" Y="0.1143" />
                <NormalBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/kong_n.png" Plist="PlaybackUI.plist" />
                <PressedBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/kong_s.png" Plist="PlaybackUI.plist" />
                <NodeNormalFileData Type="MarkedSubImage" Path="PlayBack2DUI/kong_s.png" Plist="PlaybackUI.plist" />
              </AbstractNodeData>
              <AbstractNodeData Name="win_chk" ActionTag="82581692" Tag="63" IconVisible="False" PositionPercentXEnabled="True" LeftMargin="4.0000" RightMargin="4.0000" TopMargin="272.9942" BottomMargin="99.0058" TouchEnable="True" ctype="CheckBoxObjectData">
                <Size X="52.0000" Y="48.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="30.0000" Y="123.0058" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.5000" Y="0.2929" />
                <PreSize X="0.8667" Y="0.1143" />
                <NormalBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/win_n.png" Plist="PlaybackUI.plist" />
                <PressedBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/win_s.png" Plist="PlaybackUI.plist" />
                <NodeNormalFileData Type="MarkedSubImage" Path="PlayBack2DUI/win_s.png" Plist="PlaybackUI.plist" />
              </AbstractNodeData>
              <AbstractNodeData Name="pass_chk" ActionTag="52319630" Tag="64" IconVisible="False" PositionPercentXEnabled="True" LeftMargin="4.0000" RightMargin="4.0000" TopMargin="347.9945" BottomMargin="24.0055" TouchEnable="True" ctype="CheckBoxObjectData">
                <Size X="52.0000" Y="48.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="30.0000" Y="48.0055" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.5000" Y="0.1143" />
                <PreSize X="0.8667" Y="0.1143" />
                <NormalBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/pass_n.png" Plist="PlaybackUI.plist" />
                <PressedBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/pass_s.png" Plist="PlaybackUI.plist" />
                <NodeNormalFileData Type="MarkedSubImage" Path="PlayBack2DUI/pass_s.png" Plist="PlaybackUI.plist" />
              </AbstractNodeData>
              <AbstractNodeData Name="pass2_chk" ActionTag="1976963839" Tag="85" IconVisible="False" PositionPercentXEnabled="True" LeftMargin="4.0000" RightMargin="4.0000" TopMargin="347.9900" BottomMargin="24.0100" TouchEnable="True" ctype="CheckBoxObjectData">
                <Size X="52.0000" Y="48.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="30.0000" Y="48.0100" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.5000" Y="0.1143" />
                <PreSize X="0.8667" Y="0.1143" />
                <NormalBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/pass2_n.png" Plist="PlaybackUI.plist" />
                <PressedBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/pass2_s.png" Plist="PlaybackUI.plist" />
                <NodeNormalFileData Type="MarkedSubImage" Path="PlayBack2DUI/pass2_s.png" Plist="PlaybackUI.plist" />
              </AbstractNodeData>
            </Children>
            <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
            <Position X="1060.2240" Y="396.0000" />
            <Scale ScaleX="1.0000" ScaleY="1.0000" />
            <CColor A="255" R="255" G="255" B="255" />
            <PrePosition X="0.8283" Y="0.5500" />
            <PreSize X="0.0469" Y="0.5833" />
            <SingleColor A="255" R="150" G="200" B="255" />
            <FirstColor A="255" R="150" G="200" B="255" />
            <EndColor A="255" R="255" G="255" B="255" />
            <ColorVector ScaleY="1.0000" />
          </AbstractNodeData>
          <AbstractNodeData Name="player_operation_panel2" ActionTag="-761530772" VisibleForFrame="False" Tag="70" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="360.0000" RightMargin="360.0000" TopMargin="85.4960" BottomMargin="554.5040" TouchEnable="True" ClipAble="False" BackColorAlpha="102" ColorAngle="90.0000" Scale9Width="1" Scale9Height="1" ctype="PanelObjectData">
            <Size X="560.0000" Y="80.0000" />
            <Children>
              <AbstractNodeData Name="chow_chk" ActionTag="2009434049" Tag="71" IconVisible="False" PositionPercentYEnabled="True" LeftMargin="96.0000" RightMargin="412.0000" TopMargin="16.0000" BottomMargin="16.0000" TouchEnable="True" ctype="CheckBoxObjectData">
                <Size X="52.0000" Y="48.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="122.0000" Y="40.0000" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.2179" Y="0.5000" />
                <PreSize X="0.0929" Y="0.6000" />
                <NormalBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/chow_n.png" Plist="PlaybackUI.plist" />
                <PressedBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/chow_s.png" Plist="PlaybackUI.plist" />
                <NodeNormalFileData Type="MarkedSubImage" Path="PlayBack2DUI/chow_s.png" Plist="PlaybackUI.plist" />
              </AbstractNodeData>
              <AbstractNodeData Name="pong_chk" ActionTag="-1925752331" Tag="72" IconVisible="False" PositionPercentYEnabled="True" LeftMargin="174.0000" RightMargin="334.0000" TopMargin="16.0000" BottomMargin="16.0000" TouchEnable="True" ctype="CheckBoxObjectData">
                <Size X="52.0000" Y="48.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="200.0000" Y="40.0000" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.3571" Y="0.5000" />
                <PreSize X="0.0929" Y="0.6000" />
                <NormalBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/pong_n.png" Plist="PlaybackUI.plist" />
                <PressedBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/pong_s.png" Plist="PlaybackUI.plist" />
                <NodeNormalFileData Type="MarkedSubImage" Path="PlayBack2DUI/pong_s.png" Plist="PlaybackUI.plist" />
              </AbstractNodeData>
              <AbstractNodeData Name="kong_chk" ActionTag="-707456041" Tag="73" IconVisible="False" PositionPercentYEnabled="True" LeftMargin="252.0000" RightMargin="256.0000" TopMargin="16.0000" BottomMargin="16.0000" TouchEnable="True" ctype="CheckBoxObjectData">
                <Size X="52.0000" Y="48.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="278.0000" Y="40.0000" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.4964" Y="0.5000" />
                <PreSize X="0.0929" Y="0.6000" />
                <NormalBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/kong_n.png" Plist="PlaybackUI.plist" />
                <PressedBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/kong_s.png" Plist="PlaybackUI.plist" />
                <NodeNormalFileData Type="MarkedSubImage" Path="PlayBack2DUI/kong_s.png" Plist="PlaybackUI.plist" />
              </AbstractNodeData>
              <AbstractNodeData Name="win_chk" ActionTag="-101090178" Tag="74" IconVisible="False" PositionPercentYEnabled="True" LeftMargin="330.0000" RightMargin="178.0000" TopMargin="16.0000" BottomMargin="16.0000" TouchEnable="True" ctype="CheckBoxObjectData">
                <Size X="52.0000" Y="48.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="356.0000" Y="40.0000" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.6357" Y="0.5000" />
                <PreSize X="0.0929" Y="0.6000" />
                <NormalBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/win_n.png" Plist="PlaybackUI.plist" />
                <PressedBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/win_s.png" Plist="PlaybackUI.plist" />
                <NodeNormalFileData Type="MarkedSubImage" Path="PlayBack2DUI/win_s.png" Plist="PlaybackUI.plist" />
              </AbstractNodeData>
              <AbstractNodeData Name="pass_chk" ActionTag="-710547193" Tag="75" IconVisible="False" PositionPercentYEnabled="True" LeftMargin="408.0000" RightMargin="100.0000" TopMargin="16.0000" BottomMargin="16.0000" TouchEnable="True" ctype="CheckBoxObjectData">
                <Size X="52.0000" Y="48.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="434.0000" Y="40.0000" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.7750" Y="0.5000" />
                <PreSize X="0.0929" Y="0.6000" />
                <NormalBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/pass_n.png" Plist="PlaybackUI.plist" />
                <PressedBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/pass_s.png" Plist="PlaybackUI.plist" />
                <NodeNormalFileData Type="MarkedSubImage" Path="PlayBack2DUI/pass_s.png" Plist="PlaybackUI.plist" />
              </AbstractNodeData>
              <AbstractNodeData Name="pass2_chk" ActionTag="2027008035" Tag="86" IconVisible="False" PositionPercentYEnabled="True" LeftMargin="408.0000" RightMargin="100.0000" TopMargin="16.0000" BottomMargin="16.0000" TouchEnable="True" ctype="CheckBoxObjectData">
                <Size X="52.0000" Y="48.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="434.0000" Y="40.0000" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.7750" Y="0.5000" />
                <PreSize X="0.0929" Y="0.6000" />
                <NormalBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/pass2_n.png" Plist="PlaybackUI.plist" />
                <PressedBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/pass2_s.png" Plist="PlaybackUI.plist" />
                <NodeNormalFileData Type="MarkedSubImage" Path="PlayBack2DUI/pass2_s.png" Plist="PlaybackUI.plist" />
              </AbstractNodeData>
            </Children>
            <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
            <Position X="640.0000" Y="594.5040" />
            <Scale ScaleX="1.0000" ScaleY="1.0000" />
            <CColor A="255" R="255" G="255" B="255" />
            <PrePosition X="0.5000" Y="0.8257" />
            <PreSize X="0.4375" Y="0.1111" />
            <SingleColor A="255" R="150" G="200" B="255" />
            <FirstColor A="255" R="150" G="200" B="255" />
            <EndColor A="255" R="255" G="255" B="255" />
            <ColorVector ScaleY="1.0000" />
          </AbstractNodeData>
          <AbstractNodeData Name="player_operation_panel3" ActionTag="443443310" VisibleForFrame="False" Tag="76" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="178.6400" RightMargin="1041.3600" TopMargin="114.0000" BottomMargin="186.0000" TouchEnable="True" ClipAble="False" BackColorAlpha="102" ColorAngle="90.0000" Scale9Width="1" Scale9Height="1" ctype="PanelObjectData">
            <Size X="60.0000" Y="420.0000" />
            <Children>
              <AbstractNodeData Name="chow_chk" ActionTag="1428675044" Tag="77" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="4.0000" RightMargin="4.0000" TopMargin="31.9440" BottomMargin="340.0560" TouchEnable="True" ctype="CheckBoxObjectData">
                <Size X="52.0000" Y="48.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="30.0000" Y="364.0560" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.5000" Y="0.8668" />
                <PreSize X="0.8667" Y="0.1143" />
                <NormalBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/chow_n.png" Plist="PlaybackUI.plist" />
                <PressedBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/chow_s.png" Plist="PlaybackUI.plist" />
                <NodeNormalFileData Type="MarkedSubImage" Path="PlayBack2DUI/chow_s.png" Plist="PlaybackUI.plist" />
              </AbstractNodeData>
              <AbstractNodeData Name="pong_chk" ActionTag="-969952863" Tag="78" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="4.0000" RightMargin="4.0000" TopMargin="106.9560" BottomMargin="265.0440" TouchEnable="True" ctype="CheckBoxObjectData">
                <Size X="52.0000" Y="48.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="30.0000" Y="289.0440" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.5000" Y="0.6882" />
                <PreSize X="0.8667" Y="0.1143" />
                <NormalBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/pong_n.png" Plist="PlaybackUI.plist" />
                <PressedBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/pong_s.png" Plist="PlaybackUI.plist" />
                <NodeNormalFileData Type="MarkedSubImage" Path="PlayBack2DUI/pong_s.png" Plist="PlaybackUI.plist" />
              </AbstractNodeData>
              <AbstractNodeData Name="kong_chk" ActionTag="-2081700667" Tag="79" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="4.0000" RightMargin="4.0000" TopMargin="181.9680" BottomMargin="190.0320" TouchEnable="True" ctype="CheckBoxObjectData">
                <Size X="52.0000" Y="48.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="30.0000" Y="214.0320" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.5000" Y="0.5096" />
                <PreSize X="0.8667" Y="0.1143" />
                <NormalBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/kong_n.png" Plist="PlaybackUI.plist" />
                <PressedBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/kong_s.png" Plist="PlaybackUI.plist" />
                <NodeNormalFileData Type="MarkedSubImage" Path="PlayBack2DUI/kong_s.png" Plist="PlaybackUI.plist" />
              </AbstractNodeData>
              <AbstractNodeData Name="win_chk" ActionTag="645903828" Tag="80" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="4.0000" RightMargin="4.0000" TopMargin="256.9800" BottomMargin="115.0200" TouchEnable="True" ctype="CheckBoxObjectData">
                <Size X="52.0000" Y="48.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="30.0000" Y="139.0200" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.5000" Y="0.3310" />
                <PreSize X="0.8667" Y="0.1143" />
                <NormalBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/win_n.png" Plist="PlaybackUI.plist" />
                <PressedBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/win_s.png" Plist="PlaybackUI.plist" />
                <NodeNormalFileData Type="MarkedSubImage" Path="PlayBack2DUI/win_s.png" Plist="PlaybackUI.plist" />
              </AbstractNodeData>
              <AbstractNodeData Name="pass_chk" ActionTag="-2111118945" Tag="81" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="4.0000" RightMargin="4.0000" TopMargin="331.9500" BottomMargin="40.0500" TouchEnable="True" ctype="CheckBoxObjectData">
                <Size X="52.0000" Y="48.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="30.0000" Y="64.0500" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.5000" Y="0.1525" />
                <PreSize X="0.8667" Y="0.1143" />
                <NormalBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/pass_n.png" Plist="PlaybackUI.plist" />
                <PressedBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/pass_s.png" Plist="PlaybackUI.plist" />
                <NodeNormalFileData Type="MarkedSubImage" Path="PlayBack2DUI/pass_s.png" Plist="PlaybackUI.plist" />
              </AbstractNodeData>
              <AbstractNodeData Name="pass2_chk" ActionTag="1435989761" Tag="87" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="4.0000" RightMargin="4.0000" TopMargin="331.9500" BottomMargin="40.0500" TouchEnable="True" ctype="CheckBoxObjectData">
                <Size X="52.0000" Y="48.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="30.0000" Y="64.0500" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.5000" Y="0.1525" />
                <PreSize X="0.8667" Y="0.1143" />
                <NormalBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/pass2_n.png" Plist="PlaybackUI.plist" />
                <PressedBackFileData Type="MarkedSubImage" Path="PlayBack2DUI/pass2_s.png" Plist="PlaybackUI.plist" />
                <NodeNormalFileData Type="MarkedSubImage" Path="PlayBack2DUI/pass2_s.png" Plist="PlaybackUI.plist" />
              </AbstractNodeData>
            </Children>
            <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
            <Position X="208.6400" Y="396.0000" />
            <Scale ScaleX="1.0000" ScaleY="1.0000" />
            <CColor A="255" R="255" G="255" B="255" />
            <PrePosition X="0.1630" Y="0.5500" />
            <PreSize X="0.0469" Y="0.5833" />
            <SingleColor A="255" R="150" G="200" B="255" />
            <FirstColor A="255" R="150" G="200" B="255" />
            <EndColor A="255" R="255" G="255" B="255" />
            <ColorVector ScaleY="1.0000" />
          </AbstractNodeData>
          <AbstractNodeData Name="finger_img" ActionTag="-574708197" Tag="82" IconVisible="False" LeftMargin="-179.3012" RightMargin="1385.3011" TopMargin="530.5042" BottomMargin="111.4958" ctype="SpriteObjectData">
            <Size X="74.0000" Y="78.0000" />
            <AnchorPoint ScaleY="1.0000" />
            <Position X="-179.3012" Y="189.4958" />
            <Scale ScaleX="1.0000" ScaleY="1.0000" />
            <CColor A="255" R="255" G="255" B="255" />
            <PrePosition X="-0.1401" Y="0.2632" />
            <PreSize X="0.0578" Y="0.1083" />
            <FileData Type="MarkedSubImage" Path="PlayBack2DUI/finger.png" Plist="PlaybackUI.plist" />
            <BlendFunc Src="1" Dst="771" />
          </AbstractNodeData>
        </Children>
      </ObjectData>
    </Content>
  </Content>
</GameFile>